import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardSectionHeaderProps {
    title: string;
    icon: React.ReactNode;
    navigateTo: string;
}

export function DashboardSectionHeader({ title, icon, navigateTo }: DashboardSectionHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 tracking-tight">
                {icon}
                {title}
            </h2>
            <button
                onClick={() => navigate(navigateTo)}
                className="p-1 text-primary hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                aria-label={`Ver mais ${title}`}
            >
                <ArrowRight size={20} />
            </button>
        </div>
    );
}
