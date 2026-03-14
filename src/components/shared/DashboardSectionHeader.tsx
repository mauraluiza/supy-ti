import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardSectionHeaderProps {
    title: string;
    icon: React.ReactNode;
    navigateTo: string;
    count?: number;
}

export function DashboardSectionHeader({ title, icon, navigateTo, count }: DashboardSectionHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2 tracking-tight">
                {icon}
                <span>
                    {title}
                    {count !== undefined && (
                        <span className="ml-2 font-medium text-gray-500 text-sm">({count})</span>
                    )}
                </span>
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
