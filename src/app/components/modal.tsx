'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    type?: 'danger' | 'info';
}

export function Modal({ isOpen, onClose, title, children, type = 'info' }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    // Tactical colors based on type
    const borderColor = type === 'danger' ? 'border-red-500/50' : 'border-blue-500/50';
    const glowColor = type === 'danger' ? 'shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'shadow-[0_0_50px_rgba(59,130,246,0.2)]';
    const headerColor = type === 'danger' ? 'text-red-400' : 'text-blue-400';

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-enter"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`
                relative w-full max-w-lg bg-[#0a0a0a] border ${borderColor} ${glowColor}
                rounded-lg overflow-hidden animate-enter
            `}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <h3 className={`font-display font-bold text-xl tracking-wider ${headerColor}`}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>

                {/* Tactical Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />
            </div>
        </div>,
        document.body
    );
}
