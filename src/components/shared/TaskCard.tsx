import type { Task } from "../../types";
import { Clock, CheckSquare, AlertCircle, PlayCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { cn, formatRelativeTime } from "../../lib/utils";

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    interactive?: boolean;
}

const statusMap = {
    urgent: {
        label: "Urgente",
        color: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: AlertCircle
    },
    in_progress: {
        label: "Em Andamento",
        color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        icon: PlayCircle
    },
    pending: {
        label: "Pendente",
        color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        icon: Clock
    },
    done: {
        label: "Concluída",
        color: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
        icon: CheckSquare
    },
};

export function TaskCard({ task, onEdit, interactive = true }: TaskCardProps) {
    const config = statusMap[task.status] || statusMap.pending;
    const StatusIcon = config.icon;
    const clientName = task.client?.name || "Cliente Desconhecido"; // Fallback if client relation is missing

    // Parse description HTML content to plain text for preview
    // This is useful if description is rich text (HTML)
    const plainDescription = task.description.replace(/<[^>]+>/g, '');

    return (
        <Card
            className={cn(
                "border-l-4 overflow-hidden relative min-h-[140px] flex flex-col",
                interactive ? "group hover:shadow-md transition-all cursor-pointer" : "cursor-default"
            )}
            style={{ borderLeftColor: `var(--color-${task.status === 'urgent' ? 'red' : task.status === 'in_progress' ? 'orange' : task.status === 'done' ? 'green' : 'yellow'}-500)` }}
            onClick={() => interactive && onEdit?.(task)}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <span className={cn("text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shrink-0", config.color)}>
                        <StatusIcon size={12} />
                        {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 min-w-max">
                        {formatRelativeTime(task.created_at)}
                    </span>
                </div>
                <CardTitle className="text-lg font-bold leading-tight mt-2 text-foreground break-words line-clamp-1">
                    {clientName}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {plainDescription || "Sem descrição..."}
                </p>
            </CardContent>
            {interactive && (
                <CardFooter className="pt-0 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                    <span className="text-xs text-primary font-medium">Clique para editar</span>
                </CardFooter>
            )}
        </Card>
    );
}
