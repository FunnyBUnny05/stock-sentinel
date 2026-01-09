import { prisma } from '@/lib/db';
import { IntelCard } from './intel-card';
import { ShieldAlert } from 'lucide-react';

export async function IntelGrid() {
    const setups = await prisma.stockSetup.findMany({
        orderBy: { createdAt: 'desc' },
    });

    if (setups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 opacity-30">
                <ShieldAlert className="w-16 h-16 text-gray-500 mb-4" />
                <div className="text-gray-500 font-mono text-xl tracking-widest uppercase">
                    [ NO_ACTIVE_TARGETS_DETECTED ]
                </div>
                <div className="text-gray-600 font-mono text-sm mt-2">
                    INITIATE_SCAN_PROTOCOL_ABOVE
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {setups.map((setup) => (
                <IntelCard key={setup.id} setup={setup} />
            ))}
        </div>
    );
}
