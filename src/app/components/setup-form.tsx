'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createSetup } from '../actions';

const initialState = {
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <>
            <button type="submit" className="hidden" />
            {pending && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-blue-400 font-mono text-xs animate-pulse">
                        [ SYSTEM_PROCESSING ]
                    </span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                </div>
            )}
        </>
    );
}

export function SetupForm() {
    const [state, formAction] = useActionState(createSetup, initialState);

    return (
        <div className="w-full mb-8">
            <div className="bg-black/50 border border-white/10 rounded-sm p-3 flex items-center font-mono text-lg shadow-inner relative overflow-hidden">
                {/* Scan Line Effect */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                <span className="text-green-500 mr-3 select-none text-base md:text-lg">{'>'}</span>
                <span className="text-blue-400 mr-2 select-none text-sm md:text-base hidden sm:inline">SCAN_TARGET:</span>

                <form action={formAction} className="flex-1 flex items-center">
                    <input
                        className="w-full bg-transparent text-white placeholder-gray-700 outline-none uppercase tracking-wider text-sm md:text-lg"
                        id="ticker"
                        name="ticker"
                        type="text"
                        placeholder="ENTER_SYMBOL..."
                        required
                        autoComplete="off"
                        autoFocus
                    />
                    <SubmitButton />
                </form>
            </div>

            {state?.message && (
                <div className="mt-2 text-xs font-mono text-blue-400 ml-4 animate-enter">
                    {`>> SYSTEM_MSG: ${state.message}`}
                </div>
            )}
        </div>
    );
}
