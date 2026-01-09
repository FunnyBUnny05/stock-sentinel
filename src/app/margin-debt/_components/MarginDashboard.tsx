'use client';

import { useState } from 'react';

type DashboardView = 'FINRA' | 'AAII';
type TimeRange = '2Y' | '5Y' | '10Y' | 'ALL';

export function MarginDashboard() {
    const [view, setView] = useState<DashboardView>('FINRA');
    const [timeRange, setTimeRange] = useState<TimeRange>('ALL');

    return (
        <div className="min-h-screen bg-[#0d0d1a] text-white relative overflow-hidden">
            {/* Background Glows */}
            <div
                className="fixed top-0 left-0 w-[800px] h-[800px] pointer-events-none"
                style={{ background: 'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)' }}
            />
            <div
                className="fixed bottom-0 right-0 w-[600px] h-[600px] pointer-events-none"
                style={{ background: 'radial-gradient(circle at 90% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)' }}
            />

            <div className="max-w-[1200px] mx-auto p-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                            {view === 'FINRA' ? 'FINRA Margin Debt Tracker' : 'AAII Asset Allocation Survey'}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {view === 'FINRA'
                                ? 'Track margin debt levels as a contrarian indicator for market euphoria'
                                : 'Retail investor sentiment and asset allocation trends since 1987'}
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-[#1a1a2e] rounded-lg p-1">
                        <button
                            onClick={() => setView('FINRA')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'FINRA'
                                    ? 'bg-red-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            FINRA Margin Debt
                        </button>
                        <button
                            onClick={() => setView('AAII')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'AAII'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            AAII Allocation
                        </button>
                    </div>
                </div>

                {/* Time Range Buttons */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(['2Y', '5Y', '10Y', 'ALL'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                {view === 'FINRA' ? <FINRAView /> : <AAIIView />}

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-gray-600">
                    Data sources: FINRA, AAII Sentiment Survey • Updated Monthly
                </div>
            </div>
        </div>
    );
}

function FINRAView() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800/50">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-gray-400 text-xs">Current Margin Debt</span>
                        <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">2025-11</span>
                    </div>
                    <div className="text-3xl font-bold text-red-500 mb-1">$1214B</div>
                    <div className="text-xs text-gray-500">All-time high territory</div>
                </div>
                <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800/50">
                    <div className="text-gray-400 text-xs mb-3">YoY Growth Rate</div>
                    <div className="text-3xl font-bold text-red-500 mb-1">+36.3%</div>
                    <div className="text-xs text-red-400 font-medium">🔥 Euphoria Zone</div>
                </div>
                <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800/50">
                    <div className="text-gray-400 text-xs mb-3">vs 2021 Peak ($936B)</div>
                    <div className="text-3xl font-bold text-amber-500 mb-1">+30%</div>
                    <div className="text-xs text-gray-500">Above previous cycle high</div>
                </div>
                <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800/50">
                    <div className="text-gray-400 text-xs mb-3">vs 2000 Peak ($300B)</div>
                    <div className="text-3xl font-bold text-purple-500 mb-1">+305%</div>
                    <div className="text-xs text-gray-500">Long-term leverage growth</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart - Margin Debt Over Time */}
                <div className="lg:col-span-2 bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                    <h3 className="text-sm font-medium text-white mb-4">Margin Debt Over Time</h3>
                    <div className="h-[300px] relative">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="redGrad" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                                </linearGradient>
                            </defs>
                            {/* Smooth curve area fill */}
                            <path
                                d="M0,95 C10,93 20,88 30,82 C40,76 50,65 60,50 C70,35 80,25 90,18 C95,14 100,10 100,10 L100,100 L0,100 Z"
                                fill="url(#redGrad)"
                            />
                            {/* Smooth curve line */}
                            <path
                                d="M0,95 C10,93 20,88 30,82 C40,76 50,65 60,50 C70,35 80,25 90,18 C95,14 100,10 100,10"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2.5"
                            />
                        </svg>
                        <div className="absolute bottom-0 left-0 text-[10px] text-gray-500">1997</div>
                        <div className="absolute bottom-0 right-0 text-[10px] text-gray-500">2025</div>
                        <div className="absolute top-0 right-0 text-[10px] text-gray-500">$1214B</div>
                        <div className="absolute bottom-0 right-0 -translate-y-6 text-[10px] text-gray-500">$0</div>
                    </div>
                </div>

                {/* Growth Rate Chart */}
                <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                    <h3 className="text-sm font-medium text-white mb-4">Year-over-Year Growth</h3>
                    <div className="h-[300px] relative">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="orangeGrad" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                                </linearGradient>
                            </defs>
                            {/* Zero line */}
                            <line x1="0" x2="100" y1="50" y2="50" stroke="#374151" strokeWidth="1" strokeDasharray="4" />
                            {/* Smooth curve area fill */}
                            <path
                                d="M0,30 C10,35 20,60 30,45 C40,30 50,20 60,35 C70,50 80,40 90,25 C95,18 100,22 100,22 L100,50 L0,50 Z"
                                fill="url(#orangeGrad)"
                            />
                            {/* Smooth curve line */}
                            <path
                                d="M0,30 C10,35 20,60 30,45 C40,30 50,20 60,35 C70,50 80,40 90,25 C95,18 100,22 100,22"
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                            />
                        </svg>
                        <div className="absolute top-0 left-0 text-[10px] text-gray-500">+60%</div>
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[10px] text-gray-500">0%</div>
                        <div className="absolute bottom-0 left-0 text-[10px] text-gray-500">-40%</div>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-2">Monthly YoY %</div>
                </div>
            </div>

            {/* Threshold Stats */}
            <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                <h3 className="text-sm font-medium text-white mb-4">Threshold Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="text-2xl font-bold text-red-400">4 months</div>
                        <div className="text-xs text-gray-400 mt-1">Above +30% threshold</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-400">3 months 24 days</div>
                        <div className="text-xs text-gray-400 mt-1">Average euphoria duration</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-purple-400">12 instances</div>
                        <div className="text-xs text-gray-400 mt-1">Since 1997</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AAIIView() {
    return (
        <div className="space-y-6">
            {/* Current Allocation */}
            <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-white">Current Allocation</h3>
                    <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">2025-11-01</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-500">71.2%</div>
                        <div className="text-sm text-gray-400 mt-1">Stocks</div>
                        <div className="text-xs text-gray-500 mt-0.5">Hist. Avg: 62.1%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-500">14.0%</div>
                        <div className="text-sm text-gray-400 mt-1">Bonds</div>
                        <div className="text-xs text-gray-500 mt-0.5">Hist. Avg: 15.9%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-500">14.8%</div>
                        <div className="text-sm text-gray-400 mt-1">Cash</div>
                        <div className="text-xs text-gray-500 mt-0.5">Hist. Avg: 22.0%</div>
                    </div>
                </div>
            </div>

            {/* Extremes */}
            <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                <h3 className="text-sm font-medium text-white mb-4">Historical Extremes (Since 1987)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-900/50 rounded p-3">
                        <div className="text-lg font-bold text-blue-400">77.0%</div>
                        <div className="text-[10px] text-gray-400">Highest Stocks</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3">
                        <div className="text-lg font-bold text-blue-700">40.8%</div>
                        <div className="text-[10px] text-gray-400">Lowest Stocks</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3">
                        <div className="text-lg font-bold text-yellow-400">25.5%</div>
                        <div className="text-[10px] text-gray-400">Highest Bonds</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3">
                        <div className="text-lg font-bold text-yellow-700">6.9%</div>
                        <div className="text-[10px] text-gray-400">Lowest Bonds</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3">
                        <div className="text-lg font-bold text-green-400">44.8%</div>
                        <div className="text-[10px] text-gray-400">Highest Cash</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3">
                        <div className="text-lg font-bold text-green-700">11.0%</div>
                        <div className="text-[10px] text-gray-400">Lowest Cash</div>
                    </div>
                </div>
            </div>

            {/* Chart - Asset Allocation Over Time */}
            <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
                <h3 className="text-sm font-medium text-white mb-4">Asset Allocation Over Time</h3>
                <div className="h-[300px] relative">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="stockGradAAII" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                            </linearGradient>
                            <linearGradient id="bondGradAAII" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#eab308" stopOpacity="0.05" />
                            </linearGradient>
                            <linearGradient id="cashGradAAII" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>

                        {/* Stocks (Blue) - 40-77% range */}
                        <path
                            d="M0,50 C15,52 25,45 40,40 C55,35 70,32 85,28 C95,24 100,20 100,20 L100,100 L0,100 Z"
                            fill="url(#stockGradAAII)"
                        />
                        <path
                            d="M0,50 C15,52 25,45 40,40 C55,35 70,32 85,28 C95,24 100,20 100,20"
                            fill="none" stroke="#3b82f6" strokeWidth="2.5"
                        />

                        {/* Bonds (Yellow/Gold) - 7-25% range */}
                        <path
                            d="M0,78 C15,80 25,82 40,80 C55,78 70,82 85,85 C95,86 100,85 100,85 L100,100 L0,100 Z"
                            fill="url(#bondGradAAII)"
                        />
                        <path
                            d="M0,78 C15,80 25,82 40,80 C55,78 70,82 85,85 C95,86 100,85 100,85"
                            fill="none" stroke="#eab308" strokeWidth="2.5"
                        />

                        {/* Cash (Green) - 11-45% range */}
                        <path
                            d="M0,65 C15,60 25,55 40,62 C55,68 70,72 85,78 C95,82 100,85 100,85 L100,100 L0,100 Z"
                            fill="url(#cashGradAAII)"
                        />
                        <path
                            d="M0,65 C15,60 25,55 40,62 C55,68 70,72 85,78 C95,82 100,85 100,85"
                            fill="none" stroke="#22c55e" strokeWidth="2.5"
                        />
                    </svg>
                    <div className="absolute bottom-0 left-0 text-[10px] text-gray-500">1987</div>
                    <div className="absolute bottom-0 right-0 text-[10px] text-gray-500">2025</div>
                    <div className="absolute top-0 right-0 text-[10px] text-gray-500">80%</div>
                    <div className="absolute bottom-0 right-0 -translate-y-6 text-[10px] text-gray-500">0%</div>
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4 text-xs">
                    <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-blue-500"></span> Stocks</div>
                    <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-yellow-500"></span> Bonds</div>
                    <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-green-500"></span> Cash</div>
                </div>
            </div>
        </div>
    );
}
