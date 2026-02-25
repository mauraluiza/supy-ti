import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-border/60 rounded-lg bg-muted/5 animate-in fade-in duration-500",
            className
        )}>
            {Icon && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
                    <Icon className="h-8 w-8 text-muted-foreground/50" />
                </div>
            )}
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
