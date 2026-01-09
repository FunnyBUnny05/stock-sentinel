'use client';

import { useState, useTransition } from 'react';
import { deleteSetup, getFundamentals } from '../actions';
import { Modal } from './modal';
import { SetupVisualizer } from './setup-visualizer';
import { FundamentalData } from '@/lib/perplexity';
import { Trash2, BarChart2, TrendingUp, AlertTriangle, Target, Shield, Clock, Database } from 'lucide-react';

interface StockSetup {
    id: string;
    ticker: string;
    status: string;
    convictionScore: number;
    analysisMarkdown: string | null;
    entryZone: string | null;
    stopLoss: number | null;
    targetPrice: number | null;
    lastReviewedAt: Date;
    createdAt: Date;
}

type ModalTab = 'CHART' | 'FUNDAMENTALS';

export function IntelCard({ setup }: { setup: StockSetup }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<ModalTab>('CHART');
    const [fundamentals, setFundamentals] = useState<FundamentalData | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteSetup(setup.id);
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
    };

    const handleOpenModal = () => {
        setIsVisualModalOpen(true);
        setActiveTab('CHART');
    };

    const handleTabChange = (tab: ModalTab) => {
        setActiveTab(tab);
        if (tab === 'FUNDAMENTALS' && !fundamentals) {
            startTransition(async () => {
                const data = await getFundamentals(setup.ticker);
                setFundamentals(data);
            });
        }
    };

    const isLong = setup.convictionScore >= 10;
    const statusColor = setup.status === 'GREEN_LIGHT' ? 'text-green-400' : setup.status === 'WAITING' ? 'text-yellow-400' : 'text-red-400';
    const statusBg = setup.status === 'GREEN_LIGHT' ? 'bg-green-500/10 border-green-500/20' : setup.status === 'WAITING' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

    return (
        <>
            <div
                onClick={handleOpenModal}
                className="group relative bg-[#0d0d1a] border border-white/5 hover:border-blue-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10"
            >
                {/* Top Banner / Status */}
                <div className={`px-4 py-2 flex justify-between items-center border-b border-white/5 ${statusBg}`}>
                    <div className="flex items-center gap-2">
                        <Database className="w-3 h-3 text-gray-500" />
                        <span className="text-[10px] font-mono text-gray-400 tracking-wider">
                            ID: {setup.id.substring(0, 6).toUpperCase()}
                        </span>
                    </div>
                    <div className={`text-[10px] font-bold font-mono tracking-widest uppercase ${statusColor} flex items-center gap-1.5`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${setup.status === 'GREEN_LIGHT' ? 'bg-green-500 animate-pulse' : setup.status === 'WAITING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        {setup.status.replace('_', ' ')}
                    </div>
                </div>

                <div className="p-5">
                    {/* Ticker & Bias */}
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-3xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                                {setup.ticker}
                            </h3>
                            <div className="text-[10px] text-gray-500 font-mono mt-1">
                                LAST_SCAN: {new Date(setup.lastReviewedAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className={`text-right ${isLong ? 'text-green-400' : 'text-red-400'}`}>
                            <div className="text-[10px] font-mono opacity-60 uppercase mb-0.5">ALGO_BIAS</div>
                            <div className="text-xl font-bold tracking-widest flex items-center gap-1 justify-end">
                                {isLong ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                                {isLong ? 'LONG' : 'NEUTRAL'}
                            </div>
                        </div>
                    </div>

                    {/* Key Levels Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 group-hover:bg-white/[0.07] transition-colors">
                            <div className="flex items-center gap-1.5 mb-1.5 text-blue-400">
                                <Target className="w-3 h-3" />
                                <span className="text-[10px] font-mono uppercase tracking-wider">Target</span>
                            </div>
                            <div className="text-lg font-mono text-white font-medium">
                                {setup.targetPrice ? setup.targetPrice.toFixed(2) : '--'}
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 group-hover:bg-white/[0.07] transition-colors">
                            <div className="flex items-center gap-1.5 mb-1.5 text-red-400">
                                <Shield className="w-3 h-3" />
                                <span className="text-[10px] font-mono uppercase tracking-wider">Stop</span>
                            </div>
                            <div className="text-lg font-mono text-white font-medium">
                                {setup.stopLoss ? setup.stopLoss.toFixed(2) : '--'}
                            </div>
                        </div>
                    </div>

                    {/* Entry Zone Mini-Display */}
                    {setup.entryZone && (
                        <div className="bg-[#05050a] rounded border border-white/5 p-2.5 mb-4">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                EXECUTION_ZONE
                            </div>
                            <div className="text-xs text-gray-300 font-mono line-clamp-1 opacity-80">
                                {setup.entryZone}
                            </div>
                        </div>
                    )}

                    {/* Action Footer */}
                    <div className="flex justify-end pt-2 border-t border-white/5">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }}
                            className="group/btn flex items-center gap-1.5 text-[10px] font-mono text-gray-600 hover:text-red-400 transition-colors uppercase tracking-widest"
                        >
                            <Trash2 className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                            Purge_Data
                        </button>
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="CONFIRM PURGE PROTOCOL" type="danger">
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/50">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-gray-300 font-mono text-center mb-8 max-w-sm">
                        Deleting surveillance data for <span className="text-red-400 font-bold text-lg mx-1">{setup.ticker}</span> is irreversible.
                    </p>
                    <div className="flex gap-4 w-full max-w-xs">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-gray-400 font-mono text-xs rounded transition-colors"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold font-mono text-xs rounded tracking-widest transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            {isDeleting ? 'PURGING...' : 'CONFIRM'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* MAIN MODAL WITH TABS */}
            <Modal isOpen={isVisualModalOpen} onClose={() => setIsVisualModalOpen(false)} title={`INTEL: ${setup.ticker}`}>
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 bg-[#05050a] p-1.5 rounded-lg border border-white/5">
                    {(['CHART', 'FUNDAMENTALS'] as ModalTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold font-mono tracking-wider rounded-md transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            {tab === 'CHART' ? <BarChart2 className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'CHART' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <SetupVisualizer
                            data={{
                                entry: setup.entryZone,
                                stop: setup.stopLoss,
                                target: setup.targetPrice,
                                bias: setup.convictionScore >= 10,
                                ticker: setup.ticker
                            }}
                        />
                        <div className="bg-[#05050a] p-5 border border-white/5 rounded-lg mt-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                            <div className="text-[10px] text-blue-400 uppercase tracking-widest mb-3 font-mono border-b border-blue-500/10 pb-2">Tactical Strategy Brief</div>
                            <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">{setup.entryZone}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'FUNDAMENTALS' && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        {isPending ? (
                            <div className="h-64 flex flex-col items-center justify-center border border-white/5 rounded-xl bg-[#05050a]">
                                <Cpu className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                                <div className="text-blue-400 font-mono text-xs animate-pulse tracking-widest">[ ESTABLISHING_UPLINK... ]</div>
                            </div>
                        ) : fundamentals ? (
                            <>
                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Market Cap', value: fundamentals.marketCap },
                                        { label: 'P/E Ratio', value: fundamentals.peRatio },
                                        { label: 'Revenue', value: fundamentals.revenue },
                                        { label: 'EPS', value: fundamentals.eps }
                                    ].map((metric, i) => (
                                        <div key={i} className="bg-[#05050a] p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                                            <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1.5">{metric.label}</div>
                                            <div className="font-mono text-sm font-bold text-white truncate">{metric.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Sector */}
                                <div className="bg-[#05050a] p-3 rounded-lg border border-white/10">
                                    <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1.5">Sector Classification</div>
                                    <div className="font-mono text-white flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                        {fundamentals.sector}
                                    </div>
                                </div>

                                {/* AI Insight */}
                                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 p-5 rounded-xl border border-blue-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-20">
                                        <Cpu className="w-12 h-12 text-blue-500" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 relative z-10">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                                        <div className="text-[10px] text-blue-400 uppercase tracking-widest font-mono font-bold">Systems Logic Analysis</div>
                                    </div>
                                    <p className="text-sm text-gray-200 leading-relaxed font-sans relative z-10 border-l-2 border-blue-500/30 pl-3">
                                        {fundamentals.aiInsight}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-500 font-mono text-sm border border-white/5 rounded-xl bg-[#05050a]">
                                [ NO_DATA_AVAILABLE ]
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

// Icon component needed for loading state
function Cpu({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
    )
}
