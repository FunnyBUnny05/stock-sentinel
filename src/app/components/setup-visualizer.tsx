'use client';

import { useState, useMemo } from 'react';

interface SetupVisualizerProps {
    data: {
        entry: string | null;
        stop: number | null;
        target: number | null;
        bias: boolean;
        ticker: string;
    };
}

type ViewMode = 'SCHEMATIC' | 'CANDLE' | 'LINE';

// Mock Data Types
interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

function generateMockData(target: number, stop: number, entry: number, count: number = 40): Candle[] {
    const candles: Candle[] = [];
    // Start slightly above entry (the pull back)
    let currentPrice = entry * 1.02;

    // Volatility relative to range
    const range = target - stop;
    const vol = range * 0.05;

    // Generate backwards
    for (let i = 0; i < count; i++) {
        // Trend logic: recent candles (0-10) should be dropping (pullback)
        // Older candles (10-40) should be rising (uptrend)
        const isRecent = i < 10;
        const trend = isRecent ? (range * 0.01) : -(range * 0.02); // Positive adds to price (going back in time means higher price recently)

        const change = (Math.random() - 0.5) * vol + trend;
        const close = currentPrice;
        const open = close + change; // Logic reversed because we walk backwards
        const high = Math.max(open, close) + Math.random() * vol * 0.5;
        const low = Math.min(open, close) - Math.random() * vol * 0.5;

        candles.unshift({ // Add to front to restore chronological order
            time: i,
            open,
            high,
            low,
            close
        });

        currentPrice = open;
    }
    return candles;
}

export function SetupVisualizer({ data }: SetupVisualizerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('SCHEMATIC');

    // Parse data
    const stop = data.stop || 0;
    const target = data.target || 0;
    const entryMatch = data.entry?.match(/[\d.]+/);
    const entry = entryMatch ? parseFloat(entryMatch[0]) : (stop + target) / 2;

    // Memoize mock data
    const candles = useMemo(() => {
        if (!stop || !target) return [];
        return generateMockData(target, stop, entry);
    }, [target, stop, entry]);

    if (!data.stop || !data.target) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500 font-mono text-sm border border-white/5 bg-black/20 rounded">
                [ VISUALIZATION_DATA_INCOMPLETE ]
            </div>
        );
    }

    // Chart Scaling
    const allPrices = [...candles.map(c => c.high), ...candles.map(c => c.low), target, stop];
    const minPrice = Math.min(...allPrices) * 0.99;
    const maxPrice = Math.max(...allPrices) * 1.01;
    const priceRange = (maxPrice - minPrice) || 1; // Guard against division by zero

    const getY = (price: number) => {
        return 100 - ((price - minPrice) / priceRange * 100);
    };

    // Render Logic
    const renderSchematic = () => {
        // Re-use logic for schematic view (local scale)
        const sMin = stop * 0.95;
        const sMax = target * 1.05;
        const sRange = sMax - sMin;
        const getS = (p: number) => ((p - sMin) / sRange * 100);

        return (
            <div className="relative h-64 w-full border-l border-b border-white/20 bg-grid-small">
                <div className="absolute left-1/2 top-[10%] bottom-[10%] w-px border-l border-dashed border-white/20 -translate-x-1/2" />
                {/* Target */}
                <div className="absolute left-0 right-0 border-t-2 border-green-500/50 flex items-center" style={{ bottom: `${getS(target)}%` }}>
                    <div className="absolute right-2 -top-6 text-green-400 text-xs font-bold">TARGET ${target}</div>
                    <div className="w-full bg-green-500/10 h-8 absolute top-0" />
                </div>
                {/* Entry */}
                <div className="absolute left-0 right-0 border-t-2 border-blue-500 flex items-center" style={{ bottom: `${getS(entry)}%` }}>
                    <div className="absolute right-2 -top-6 text-blue-400 text-xs font-bold">ENTRY ${entry}</div>
                    <div className="absolute left-[50%] -translate-x-[50%] -top-2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" />
                </div>
                {/* Stop */}
                <div className="absolute left-0 right-0 border-t-2 border-red-500/50 flex items-center" style={{ bottom: `${getS(stop)}%` }}>
                    <div className="absolute right-2 top-2 text-red-400 text-xs font-bold">STOP ${stop}</div>
                    <div className="w-full bg-red-500/10 h-8 absolute bottom-0" />
                </div>
            </div>
        );
    };

    const renderCandles = () => {
        const width = 100 / candles.length;
        return (
            <svg className="w-full h-full" preserveAspectRatio="none">
                {/* Levels */}
                <line x1="0" x2="100%" y1={`${getY(target)}%`} y2={`${getY(target)}%`} stroke="#4ade80" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                <line x1="0" x2="100%" y1={`${getY(entry)}%`} y2={`${getY(entry)}%`} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                <line x1="0" x2="100%" y1={`${getY(stop)}%`} y2={`${getY(stop)}%`} stroke="#f87171" strokeWidth="1" strokeDasharray="4" opacity="0.5" />

                {candles.map((c, i) => {
                    const isGreen = c.close >= c.open;
                    const color = isGreen ? '#4ade80' : '#f87171';
                    const x = i * width;
                    return (
                        <g key={i}>
                            <line
                                x1={`${x + width / 2}%`} x2={`${x + width / 2}%`}
                                y1={`${getY(c.high)}%`} y2={`${getY(c.low)}%`}
                                stroke={color} strokeWidth="1"
                            />
                            <rect
                                x={`${x + width * 0.15}%`}
                                y={`${Math.min(getY(c.open), getY(c.close))}%`}
                                width={`${width * 0.7}%`}
                                height={`${Math.abs(getY(c.open) - getY(c.close))}%`}
                                fill={color}
                            />
                        </g>
                    );
                })}
            </svg>
        );
    };

    const renderLine = () => {
        const points = candles.map((c, i) => {
            const x = candles.length > 1 ? (i / (candles.length - 1)) * 100 : 50; // Guard against single candle
            const y = getY(c.close);
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Levels */}
                <line x1="0" x2="100" y1={getY(target)} y2={getY(target)} stroke="#4ade80" strokeWidth="0.5" strokeDasharray="2" opacity="0.5" />
                <line x1="0" x2="100" y1={getY(entry)} y2={getY(entry)} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2" opacity="0.5" />
                <line x1="0" x2="100" y1={getY(stop)} y2={getY(stop)} stroke="#f87171" strokeWidth="0.5" strokeDasharray="2" opacity="0.5" />

                <defs>
                    <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,100 L0,${getY(candles[0].close)} ${points.replace(/ /g, ' L')} L100,100`} fill="url(#lineGrad)" />
                <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
        );
    };

    const rr = data.stop && data.target ? (Math.abs(data.target - entry) / Math.abs(entry - data.stop)).toFixed(1) : '--';

    return (
        <div className="bg-[#0a0a0a] p-6 rounded-lg border border-white/5 font-mono">
            {/* Header / Stats */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div>
                    <div className="text-xs text-gray-500 tracking-widest uppercase">Risk/Reward</div>
                    <div className="text-2xl font-bold text-blue-400">1 : {rr}</div>
                </div>

                {/* View Toggles */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    {(['SCHEMATIC', 'CANDLE', 'LINE'] as ViewMode[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded transition-all ${viewMode === mode
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                <div className="text-right">
                    <div className="text-xs text-gray-500 tracking-widest uppercase">Target Gain</div>
                    <div className="text-2xl font-bold text-green-400">
                        {data.target ? ((data.target - entry) / entry * 100).toFixed(2) : '--'}%
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="h-64 w-full bg-[#050505] border border-white/10 relative overflow-hidden rounded">
                {viewMode === 'SCHEMATIC' && renderSchematic()}
                {viewMode === 'CANDLE' && renderCandles()}
                {viewMode === 'LINE' && renderLine()}
            </div>

            <div className="mt-4 flex justify-between text-[10px] text-gray-500 uppercase tracking-widest px-1">
                <span>{viewMode === 'SCHEMATIC' ? 'Levels View' : 'Simulated Price Action'}</span>
                <span>Interval: Daily</span>
            </div>
        </div>
    );
}
