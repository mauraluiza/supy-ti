import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">

                {/* Mobile Header (Navbar for mobile) */}
                <header className="h-16 flex items-center px-4 md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-muted-foreground hover:text-foreground p-2 -ml-2 rounded-lg hover:bg-muted"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 text-lg font-bold text-foreground">Suppy</span>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
