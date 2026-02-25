import { Search } from "lucide-react";
import { Input } from "../../ui/input";
import { cn } from "../../../lib/utils";

interface PageSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    totalResultCount?: number;
    filteredResultCount?: number;
    className?: string;
}

export function PageSearch({
    value,
    onChange,
    placeholder = "Buscar...",
    totalResultCount,
    filteredResultCount,
    className
}: PageSearchProps) {

    // Calcula texto de contagem
    const hasSearch = value.length > 0;
    const showCount = totalResultCount !== undefined;

    // Se tiver busca, mostra "X encontrados". Se não, mostra "Y totais"
    const countText = hasSearch && filteredResultCount !== undefined
        ? `${filteredResultCount} encontrado${filteredResultCount !== 1 ? 's' : ''}`
        : totalResultCount !== undefined
            ? `${totalResultCount} registro${totalResultCount !== 1 ? 's' : ''}`
            : null;

    return (
        <div className={cn("relative max-w-md", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-9 pr-20 bg-background" // pr-20 para dar espaço ao contador
                />

                {showCount && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background/80 px-1 font-medium pointer-events-none">
                        {countText}
                    </div>
                )}
            </div>
        </div>
    );
}
