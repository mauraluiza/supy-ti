
import { NavLink, useNavigate } from 'react-router-dom';
import { AppLogo } from "../ui/app-logo";
import { LayoutDashboard, Users, CheckSquare, StickyNote, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Início', path: '/' },
        { icon: Users, label: 'Clientes', path: '/clients' },
        { icon: CheckSquare, label: 'Tarefas', path: '/tasks' },
        { icon: StickyNote, label: 'Notas', path: '/notes' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    "fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <AppLogo />
                    <button
                        onClick={onClose}
                        className="md:hidden text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose()}
                            className={({ isActive }) => clsx(
                                "flex items-center space-x-3 px-4 py-2.5 rounded-md transition-all duration-200 text-sm font-medium",
                                isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon size={18} strokeWidth={2} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-border bg-background">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2.5 w-full text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
