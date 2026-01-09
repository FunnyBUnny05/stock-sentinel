import { SetupForm } from './components/setup-form';
import { SetupList } from './components/setup-list';

export default function Home() {
    return (
        <main className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto pt-8">

            {/* Zone 1: Command Input */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-blue-500"></div>
                    <h2 className="text-sm font-mono text-blue-400 tracking-widest uppercase">
                        COMMAND_INPUT
                    </h2>
                </div>
                <SetupForm />
            </section>

            {/* Zone 2: Surveillance Grid */}
            <section>
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-green-500"></div>
                        <h2 className="text-sm font-mono text-green-400 tracking-widest uppercase">
                            ACTIVE_SURVEILLANCE
                        </h2>
                    </div>
                    <div className="text-[10px] font-mono text-gray-600">
                // SECURE_CONNECTION
                    </div>
                </div>
                <SetupList />
            </section>
        </main>
    );
}
