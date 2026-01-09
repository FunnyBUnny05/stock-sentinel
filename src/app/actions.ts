'use server';

import { revalidatePath } from 'next/cache';
import { analyzeTicker } from '@/lib/perplexity';
import { prisma } from '@/lib/db';

export async function createSetup(prevState: { message: string }, formData: FormData) {
    const ticker = (formData.get('ticker') as string)?.toUpperCase();

    if (!ticker) {
        return { message: 'Ticker is required' };
    }

    try {
        const analysis = await analyzeTicker(ticker);

        const existing = await prisma.stockSetup.findFirst({
            where: { ticker: ticker }
        });

        const setupData = {
            ticker: ticker,
            status: analysis.structuredData.status,
            convictionScore: analysis.structuredData.long_bias ? 15 : 5, // Map long_bias to score
            analysisMarkdown: analysis.markdownAnalysis,
            entryZone: analysis.structuredData.entry_zone,
            stopLoss: analysis.structuredData.stop_loss,
            targetPrice: analysis.structuredData.target,
            lastReviewedAt: new Date(),
        };

        if (existing) {
            await prisma.stockSetup.update({
                where: { id: existing.id },
                data: setupData,
            });
        } else {
            await prisma.stockSetup.create({
                data: setupData,
            });
        }

        revalidatePath('/');
        return { message: `Analyzed ${ticker} successfully!` };
    } catch (error) {
        console.error('Error creating setup:', error);
        return { message: 'Failed to analyze ticker. Please try again.' };
    }
}

export async function deleteSetup(id: string) {
    try {
        await prisma.stockSetup.delete({
            where: { id },
        });
        revalidatePath('/');
        return { message: 'Deleted successfully' };
    } catch (error) {
        console.error('Error deleting setup:', error);
        return { message: 'Failed to delete' };
    }
}

// Fundamental Analysis Action - fetches on demand
import { analyzeFundamentals, FundamentalData } from '@/lib/perplexity';

export async function getFundamentals(ticker: string): Promise<FundamentalData> {
    return await analyzeFundamentals(ticker);
}
