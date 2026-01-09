'use client';

import { useState, useTransition } from 'react';
import { deleteSetup, getFundamentals } from '../actions';
import { Modal } from './modal';
import { SetupVisualizer } from './setup-visualizer';
import { FundamentalData } from '@/lib/perplexity';

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

export function SetupCard({ setup }: { setup: StockSetup }) {
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

    return (
        <>
            <div
                onClick={handleOpenModal}
                className="tech-border bg-[#0a0a0a]/90 p-5 relative group transition-all duration-300 hover:bg-[#0f0f0f] cursor-pointer"
            >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-bold font-display tracking-wider text-white group-hover:text-blue-400 transition-colors">
                            {setup.ticker}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] text-gray-500 font-mono">
                                ID: {setup.id.substring(0, 8).toUpperCase()}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }}
                                className="text-[10px] text-gray-600 hover:text-red-500 font-mono tracking-widest uppercase transition-colors"
                            >
                                [DELETE_TARGET]
                            </button>
                        </div>
                    </div>
                    <div className={`
                        px-2 py-0.5 text-[10px] font-bold font-mono border tracking-widest uppercase
                        ${setup.status === 'GREEN_LIGHT'
                            ? 'bg-green-900/20 border-green-500/50 text-green-400'
                            : setup.status === 'WAITING'
                                ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400'
                                : 'bg-red-900/20 border-red-500/50 text-red-500'
                        }
                    `}>
                        {setup.status.replace('_', ' ')}
                    </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 mb-4 pointer-events-none">
                    <div className="bg-[#0a0a0a] p-3">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Bias</div>
                        <div className={`font-mono font-bold text-sm ${setup.convictionScore >= 10 ? 'text-green-400' : 'text-red-400'}`}>
                            {setup.convictionScore >= 10 ? 'LONG' : 'NEUTRAL'}
                        </div>
                    </div>
                    <div className="bg-[#0a0a0a] p-3">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Date</div>
                        <div className="font-mono text-gray-300 text-sm">
                            {new Date(setup.lastReviewedAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="bg-[#0a0a0a] p-3">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Target</div>
                        <div className="font-mono text-blue-300 text-sm">
                            {setup.targetPrice ? `${setup.targetPrice}` : '--'}
                        </div>
                    </div>
                    <div className="bg-[#0a0a0a] p-3">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Stop</div>
                        <div className="font-mono text-red-300 text-sm">
                            {setup.stopLoss ? `${setup.stopLoss}` : '--'}
                        </div>
                    </div>
                </div>

                {setup.entryZone && (
                    <div className="bg-white/5 p-3 border-l-2 border-blue-500/50 pointer-events-none">
                        <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 font-mono">Strategy_Protocol</div>
                        <p className="text-xs text-gray-300 font-mono leading-relaxed line-clamp-2">{setup.entryZone}</p>
                    </div>
                )}

                <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/50 opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite] pointer-events-none" />
            </div>

            {/* DELETE MODAL */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="CONFIRM PURGE PROTOCOL" type="danger">
                <div className="text-center">
                    <p className="text-gray-300 font-mono mb-8">
                        Are you sure you want to remove <span className="text-red-400 font-bold">{setup.ticker}</span> from surveillance?
                        <br />This action cannot be undone.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 border border-white/10 hover:bg-white/5 text-gray-400 font-mono text-sm transition-colors">CANCEL</button>
                        <button onClick={handleDelete} disabled={isDeleting} className="px-6 py-2 bg-red-500/10 border border-red-500 text-red-400 hover:bg-red-500/20 font-mono text-sm tracking-widest transition-colors">
                            {isDeleting ? 'PURGING...' : 'CONFIRM_DELETE'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* MAIN MODAL WITH TABS */}
            <Modal isOpen={isVisualModalOpen} onClose={() => setIsVisualModalOpen(false)} title={`INTEL: ${setup.ticker}`}>
                {/* Tab Navigation */}
                <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-lg">
                    {(['CHART', 'FUNDAMENTALS'] as ModalTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`flex-1 px-4 py-2 text-xs font-bold font-mono tracking-wider rounded transition-all ${activeTab === tab ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'CHART' && (
                    <div className="mb-6">
                        <SetupVisualizer
                            data={{
                                entry: setup.entryZone,
                                stop: setup.stopLoss,
                                target: setup.targetPrice,
                                bias: setup.convictionScore >= 10,
                                ticker: setup.ticker
                            }}
                        />
                        <div className="bg-black/40 p-4 border border-white/5 rounded mt-4">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Strategy Brief</div>
                            <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">{setup.entryZone}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'FUNDAMENTALS' && (
                    <div className="space-y-4">
                        {isPending ? (
                            <div className="h-48 flex items-center justify-center">
                                <div className="text-blue-400 font-mono text-sm animate-pulse">[ FETCHING_INTEL... ]</div>
                            </div>
                        ) : fundamentals ? (
                            <>
                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 p-3 rounded border border-white/10">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Market Cap</div>
                                        <div className="font-mono text-lg text-white">{fundamentals.marketCap}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded border border-white/10">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">P/E Ratio</div>
                                        <div className="font-mono text-lg text-white">{fundamentals.peRatio}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded border border-white/10">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Revenue (TTM)</div>
                                        <div className="font-mono text-lg text-white">{fundamentals.revenue}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded border border-white/10">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">EPS (TTM)</div>
                                        <div className="font-mono text-lg text-white">{fundamentals.eps}</div>
                                    </div>
                                </div>

                                {/* Sector */}
                                <div className="bg-white/5 p-3 rounded border border-white/10">
                                    <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Sector</div>
                                    <div className="font-mono text-white">{fundamentals.sector}</div>
                                </div>

                                {/* AI Insight */}
                                <div className="bg-blue-500/10 p-4 rounded border border-blue-500/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                        <div className="text-[10px] text-blue-400 uppercase tracking-widest font-mono">AI Insight</div>
                                    </div>
                                    <p className="text-sm text-gray-200 leading-relaxed">{fundamentals.aiInsight}</p>
                                </div>
                            </>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-500 font-mono text-sm">
                                [ NO_DATA_AVAILABLE ]
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
