import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode; // Botão ou componente de ação
    className?: string;
}

export function PageHeader({ title, description, icon: Icon, action, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6", className)}>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="text-primary h-6 w-6" />}
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {title}
                    </h1>
                </div>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {action && (
                <div className="flex items-center gap-2">
                    {action}
                </div>
            )}
        </div>
    );
}
