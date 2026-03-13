import type { Task } from "../../types";
import { Clock, CheckSquare, AlertCircle, PlayCircle, Edit, Trash2, Check, Undo, Hash, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { cn, formatRelativeTime } from "../../lib/utils";

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onToggleStatus?: (task: Task) => void;
    interactive?: boolean;
}

const statusMap = {
    urgent: {
        label: "Urgente",
        color: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        borderColor: "border-l-red-500",
        icon: AlertCircle
    },
    in_progress: {
        label: "Em Andamento",
        color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        borderColor: "border-l-blue-500",
        icon: PlayCircle
    },
    pending: {
        label: "Pendente",
        color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        borderColor: "border-l-yellow-500",
        icon: Clock
    },
    done: {
        label: "Concluída",
        color: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
        borderColor: "border-l-green-500",
        icon: CheckSquare
    },
};

function formatDueAt(dateString: string) {
    const d = new Date(dateString);
    const day = d.getDate();
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const month = months[d.getMonth()];
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${h}h${m}`;
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus, interactive = true }: TaskCardProps) {
    const baseConfig = statusMap[task.status] || statusMap.pending;
    const isDone = task.status === 'done';
    const isDelayed = task.due_at ? new Date(task.due_at) < new Date() : false;
    const showDelayed = isDelayed && !isDone;

    const config = showDelayed ? {
        label: "Atrasada",
        color: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        borderColor: baseConfig.borderColor,
        icon: AlertCircle
    } : baseConfig;

    const StatusIcon = config.icon;
    const clientName = task.client?.name;

    // Parse description HTML content to plain text for preview
    // This is useful if description is rich text (HTML)
    const plainDescription = task.description.replace(/<[^>]+>/g, '');

    return (
        <Card
            className={cn(
                "border-l-4 overflow-hidden relative min-h-[120px] flex flex-col",
                config.borderColor,
                interactive ? "group hover:shadow-md transition-all cursor-pointer" : "cursor-default",
                isDone && "bg-gray-50/80 dark:bg-gray-900/50 opacity-65 hover:opacity-100 transition-opacity"
            )}
            onClick={() => interactive && onEdit?.(task)}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <span className={cn("text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shrink-0", config.color)}>
                        <StatusIcon size={12} />
                        {config.label}
                    </span>
                    
                    {/* Data formatada e Ações ao Hover */}
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap min-w-max group-hover:opacity-0 transition-opacity">
                            {formatRelativeTime(task.created_at)}
                        </span>
                        
                        {interactive && (
                            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-card shadow-sm border border-border rounded-md p-0.5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleStatus?.(task); }}
                                    className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/40 rounded-sm transition-colors"
                                    title={task.status === 'done' ? "Reabrir tarefa" : "Concluir tarefa"}
                                >
                                    {task.status === 'done' ? <Undo size={14} /> : <Check size={14} />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                                    title="Editar"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <CardTitle className={cn(
                    "text-base font-semibold leading-tight mt-2 break-words line-clamp-1 transition-colors",
                    isDone ? "line-through text-muted-foreground" : "text-foreground"
                )} title={task.title}>
                    {task.title}
                </CardTitle>
                {clientName && (
                    <div className="mt-1 flex items-center gap-1.5 min-h-[16px]">
                        <Users size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                            {clientName}
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {plainDescription || "Sem descrição..."}
                </p>
            </CardContent>
            {(task.ticket || task.due_at) && (
                <CardFooter className="pt-0 mt-auto pb-4 gap-2 flex flex-wrap">
                    {task.ticket && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-[11px] font-medium text-muted-foreground dark:bg-gray-800/40 dark:border-gray-800">
                            <Hash size={12} className="text-gray-400" />
                            {task.ticket.replace(/^#/, '')}
                        </span>
                    )}
                    {task.due_at && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-[11px] font-medium text-muted-foreground dark:bg-gray-800/40 dark:border-gray-800">
                            <Clock size={12} className="text-gray-400" />
                            {formatDueAt(task.due_at)}
                        </span>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
