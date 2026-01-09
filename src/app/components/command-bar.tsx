'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createSetup } from '../actions';
import { Search, Activity, Cpu } from 'lucide-react';

const initialState = {
    message: '',
};

function SubmitStatus() {
    const { pending } = useFormStatus();

    return (
        <div className="flex items-center gap-3">
            {pending ? (
                <>
                    <Cpu className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-blue-400 font-mono text-xs animate-pulse tracking-widest">
                        PROCESSING_TARGET...
                    </span>
                </>
            ) : (
                <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-gray-500 font-mono text-xs tracking-widest">
                        SYSTEM_READY
                    </span>
                </>
            )}
        </div>
    );
}

export function CommandBar() {
    const [state, formAction] = useActionState(createSetup, initialState);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            {/* Header / Status Bar */}
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-mono text-blue-500 tracking-[0.2em] font-bold">
                        TACTICAL_COMMAND
                    </span>
                </div>
                <SubmitStatus />
            </div>

            {/* Input Container */}
            <div className="relative group">
                {/* Glowing border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-20 group-hover:opacity-40 transition duration-500 blur-sm pointer-events-none" />

                <div className="relative bg-[#0d0d1a] border border-white/10 rounded-lg flex items-center p-4 shadow-xl">
                    <Search className="w-5 h-5 text-gray-400 mr-4" />

                    <span className="text-blue-500 font-mono mr-2 text-lg select-none">{'>'}</span>

                    <form action={formAction} className="flex-1">
                        <input
                            ref={inputRef}
                            className="w-full bg-transparent text-white placeholder-gray-700 outline-none font-mono text-lg tracking-wider uppercase"
                            id="ticker"
                            name="ticker"
                            type="text"
                            placeholder="ENTER_TICKER_SYMBOL"
                            required
                            autoComplete="off"
                        />
                    </form>

                    {/* Decorative HUD Elements */}
                    <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-gray-600 border-l border-white/5 pl-4 ml-2 select-none">
                        <span>NET_V.1.0</span>
                        <span>SECURE</span>
                    </div>
                </div>
            </div>

            {/* System Output Message */}
            {state?.message && (
                <div className="mt-3 ml-1 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span className="text-blue-500/50 text-xs">└─</span>
                    <span className="text-xs font-mono text-blue-400">
                        {`>> OUT: ${state.message}`}
                    </span>
                </div>
            )}
        </div>
    );
}
