import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch live data from the original margin-Debtt GitHub Pages deployment
        // This JSON is automatically updated weekly by GitHub Actions
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(
            'https://funnybunny05.github.io/margin-Debtt/margin_data.json',
            {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; StockSentinel/1.0)',
                    'Cache-Control': 'no-cache'
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to fetch margin data: ${response.status}`);
        }

        const json = await response.json();

        if (!json.data?.length) {
            throw new Error('No margin data in response');
        }

        return NextResponse.json({
            success: true,
            source: 'FINRA Margin Statistics (live)',
            source_url: json.source_url || 'https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics',
            last_updated: json.last_updated || json.data[json.data.length - 1]?.date,
            data: json.data
        });
    } catch (error) {
        console.error('Margin Data API Error:', error);

        // Return error response - client will fall back to cached data
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch live margin data'
        }, { status: 500 });
    }
}
