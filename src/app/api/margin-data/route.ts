import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Normalize date format to YYYY-MM
function normalizeMonthKey(dateStr: string): string {
    // Handle Excel date serial numbers
    if (typeof dateStr === 'number') {
        const date = XLSX.SSF.parse_date_code(dateStr);
        return `${date.y}-${String(date.m).padStart(2, '0')}`;
    }

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    }

    const parts = dateStr.split(/[-/]/);
    if (parts.length >= 2) {
        const [p1, p2] = parts;
        if (p1.length === 4) {
            return `${p1}-${p2.padStart(2, '0')}`;
        }
        if (p2.length === 4) {
            return `${p2}-${p1.padStart(2, '0')}`;
        }
    }

    return dateStr;
}

interface RawRow {
    [key: string]: string | number | undefined;
}

// Parse FINRA Excel data
function parseFinraExcel(buffer: ArrayBuffer) {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: RawRow[] = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData.length) return [];

    // Find the columns for date and debit balance
    const firstRow = jsonData[0];
    let dateKey = '';
    let debitKey = '';

    for (const key of Object.keys(firstRow)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('date') || lowerKey.includes('month') || lowerKey.includes('end of month')) {
            dateKey = key;
        }
        if (lowerKey.includes('debit') || lowerKey.includes('margin')) {
            debitKey = key;
        }
    }

    if (!dateKey || !debitKey) {
        // Try alternative column detection
        const keys = Object.keys(firstRow);
        if (keys.length >= 2) {
            dateKey = keys[0]; // First column is usually date
            debitKey = keys[1]; // Second column is usually debit balance
        }
    }

    if (!dateKey || !debitKey) return [];

    const parsed = jsonData
        .map(row => {
            const dateRaw = row[dateKey];
            const debitRaw = row[debitKey];

            if (!dateRaw || !debitRaw) return null;

            const date = normalizeMonthKey(String(dateRaw));
            const margin_debt = typeof debitRaw === 'number'
                ? debitRaw
                : Number(String(debitRaw).replace(/[$,]/g, ''));

            if (!date || isNaN(margin_debt)) return null;

            return { date, margin_debt };
        })
        .filter((d): d is { date: string; margin_debt: number } => d !== null)
        .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate YoY growth
    return parsed.map((entry, idx) => {
        const yearBack = idx >= 12 ? parsed[idx - 12].margin_debt : null;
        const yoy_growth = yearBack ? ((entry.margin_debt / yearBack - 1) * 100) : null;
        return { ...entry, yoy_growth: yoy_growth !== null ? Number(yoy_growth.toFixed(1)) : null };
    });
}

export async function GET() {
    try {
        // Fetch live data from FINRA Excel file
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(
            'https://www.finra.org/sites/default/files/2021-03/margin-statistics.xlsx',
            {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; StockSentinel/1.0)'
                }
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`FINRA responded with status: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const data = parseFinraExcel(buffer);

        if (!data.length) {
            throw new Error('No data parsed from FINRA Excel');
        }

        return NextResponse.json({
            success: true,
            source: 'FINRA Margin Statistics (live)',
            source_url: 'https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics',
            last_updated: data[data.length - 1]?.date || new Date().toISOString(),
            data
        });
    } catch (error) {
        console.error('FINRA API Error:', error);

        // Return error response - client will fall back to cached data
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch live FINRA data'
        }, { status: 500 });
    }
}
