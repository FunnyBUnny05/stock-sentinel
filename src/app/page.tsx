
import { CommandBar } from './components/command-bar';
import { IntelGrid } from './components/intel-grid';

export default function Home() {
    return (
        <main className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto pt-8 pb-32">
            <CommandBar />

            {/* Zone 2: Surveillance Grid */}
            <section>
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                        <h2 className="text-sm font-mono text-green-400 tracking-[0.2em] uppercase font-bold">
                            ACTIVE_INTEL_GRID
                        </h2>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span>LIVE_FEED</span>
                        </div>
                        <span>SECURE_UPLINK</span>
                    </div>
                </div>

                <IntelGrid />
            </section>
        </main>
    );
}
