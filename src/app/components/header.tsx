'use client';

import { useEffect, useState } from 'react';

export function Header() {
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                    <div className="text-xl font-display font-bold tracking-tighter text-white">
                        STOCK SENTINEL <span className="text-blue-500 text-xs align-top">v1.2</span>
                    </div>
                    <div className="hidden md:flex h-4 w-px bg-white/20 mx-2" />
                    <div className="hidden md:block text-xs text-gray-500 tracking-widest font-mono">
                        INSTITUTIONAL ANALYSIS ENGINE
                    </div>
                </div>

                <nav className="flex items-center gap-6">
                    <a href="/" className="text-xs font-mono font-bold text-gray-400 hover:text-white transition-colors tracking-widest uppercase">
                        Dashboard
                    </a>
                    <a href="/margin-debt" className="text-xs font-mono font-bold text-purple-400 hover:text-purple-300 transition-colors tracking-widest uppercase flex items-center gap-1">
                        <span className="w-1 h-1 bg-purple-500 rounded-full" />
                        Macro Liquidity
                    </a>
                </nav>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-gray-400">SYSTEM: ONLINE</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-gray-400">DB: CONNECTED</span>
                </div>
                <div className="text-blue-400 font-bold w-24 text-right">
                    {time}
                </div>
            </div>
        </header>
    );
}
