import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

interface PageContainerProps {
    children: ReactNode;
    className?: string; // Permitir override se necessário, mas desencorajar
}

export function PageContainer({ children, className }: PageContainerProps) {
    return (
        // Padroniza padding e largura máxima
        // pb-20 garante espaço no fim para não colar no rodapé se houver scrolling
        <div className={cn("p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500", className)}>
            {children}
        </div>
    );
}
