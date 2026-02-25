import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateInput: Date | string | number | undefined): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);

    let formatted = formatDistanceToNow(date, { addSuffix: true, locale: ptBR });

    // Limpeza para formato curto e direto
    formatted = formatted.replace('cerca de ', '');
    formatted = formatted.replace('aproximadamente ', '');
    formatted = formatted.replace(' atrás', '');

    if (formatted === 'há menos de um minuto' || formatted === 'menos de um minuto') {
        return 'agora';
    }

    return formatted;
}
