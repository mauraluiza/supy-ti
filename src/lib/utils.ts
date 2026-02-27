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

export function getClientRowClass(client: { system?: string, status?: string }) {
    // Garantir que a lógica use APENAS client.system e client.status independentemente de outras variáveis
    const status = client.status?.toLowerCase();
    const system = client.system?.toLowerCase();

    let baseClass = "transition-colors border-l-4 ";

    if (status === 'inactive' || status === 'inativo') {
        baseClass += "border-l-gray-300 bg-muted/40 opacity-70";
    } else {
        // Para clientes ativos ou em implantação, a cor reflete o sistema
        if (system === 'winfood') {
            baseClass += "border-l-red-500 bg-red-50/30 hover:bg-red-50/50 dark:bg-red-900/10 dark:hover:bg-red-900/20";
        } else if (system === 'cplug') {
            baseClass += "border-l-blue-500 bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20";
        } else {
            // Fallback
            baseClass += "border-l-blue-500 bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20";
        }
    }

    return baseClass;
}
