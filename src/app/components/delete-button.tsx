'use client';

import { deleteSetup } from '../actions';
import { useTransition } from 'react';

export function DeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm('CONFIRM DELETION PROTOCOL?')) {
                    startTransition(() => {
                        deleteSetup(id);
                    });
                }
            }}
            disabled={isPending}
            className="text-[10px] text-gray-600 hover:text-red-500 font-mono tracking-widest uppercase transition-colors disabled:opacity-50"
        >
            {isPending ? 'PURGING...' : '[DELETE_TARGET]'}
        </button>
    );
}
