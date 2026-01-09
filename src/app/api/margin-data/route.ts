import { NextResponse } from 'next/server';

// Normalize date format to YYYY-MM
function normalizeMonthKey(dateStr: string): string {
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

// Parse FINRA CSV data
function parseFinraMarginCsv(text: string) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const debtIdx = headers.findIndex(h => h.includes('debit'));

    if (dateIdx === -1 || debtIdx === -1) return [];

    const rows = lines.slice(1)
        .map(line => line.split(',').map(cell => cell.trim()))
        .filter(parts => parts.length > Math.max(dateIdx, debtIdx));

    const parsed = rows.map(parts => ({
        date: normalizeMonthKey(parts[dateIdx]),
        margin_debt: Number(parts[debtIdx].replace(/,/g, ''))
    }))
        .filter(d => d.date && !Number.isNaN(d.margin_debt))
        .sort((a, b) => a.date.localeCompare(b.date));

    return parsed.map((entry, idx) => {
        const yearBack = idx >= 12 ? parsed[idx - 12].margin_debt : null;
        const yoy_growth = yearBack ? ((entry.margin_debt / yearBack - 1) * 100) : null;
        return { ...entry, yoy_growth: yoy_growth !== null ? Number(yoy_growth.toFixed(1)) : null };
    });
}

export async function GET() {
    try {
        // Fetch live data from FINRA
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(
            'https://www.finra.org/sites/default/files/Industry_Margin_Statistics.csv',
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

        const csvText = await response.text();
        const data = parseFinraMarginCsv(csvText);

        if (!data.length) {
            throw new Error('No data parsed from FINRA CSV');
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
