import { prisma } from '@/lib/db';
import { SetupCard } from './setup-card';

export async function SetupList() {
    const setups = await prisma.stockSetup.findMany({
        orderBy: { createdAt: 'desc' },
    });

    if (setups.length === 0) {
        return (
            <div className="text-center py-20 opacity-30 font-mono">
                [ NO_ACTIVE_TARGETS_FOUND ]
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {setups.map((setup) => (
                <SetupCard key={setup.id} setup={setup} />
            ))}
        </div>
    );
}
