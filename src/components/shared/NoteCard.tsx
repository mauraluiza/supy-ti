import { Star, Edit, Trash2 } from "lucide-react";
import type { Note } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { cn, formatRelativeTime } from "../../lib/utils";

interface NoteCardProps {
    note: Note;
    onEdit?: (note: Note) => void;
    onDelete?: (noteId: string) => void;
    onToggleFavorite?: (note: Note) => void;
    interactive?: boolean;
}

export function NoteCard({ note, onEdit, onDelete, onToggleFavorite, interactive = true }: NoteCardProps) {

    // Função para limpar HTML do Rich Text e resumir
    const plainContent = note.content.replace(/<[^>]+>/g, ' ');
    const summary = plainContent.length > 120
        ? plainContent.substring(0, 120) + "..."
        : plainContent;

    return (
        <Card 
            onClick={() => interactive && onEdit?.(note)}
            className={cn(
            "relative overflow-hidden bg-card flex flex-col h-[140px]",
            note.is_favorite ? "border-l-4 border-l-yellow-400" : "border-border",
            interactive ? "group hover:shadow-md transition-all cursor-pointer" : "cursor-default"
        )}>

            <CardHeader className="pb-2 space-y-0">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-semibold leading-tight text-foreground line-clamp-2 break-words mt-1 pr-12">
                        {note.title}
                    </CardTitle>
                    
                    {/* Data formatada e Ações ao Hover */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 group-hover:opacity-0 transition-opacity">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatRelativeTime(note.updated_at || note.created_at)}
                            </span>
                            {interactive ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite?.(note);
                                    }}
                                    className="text-muted-foreground hover:text-yellow-500 transition-colors focus:outline-none"
                                >
                                    <Star
                                        size={16}
                                        className={cn(
                                            "transition-all",
                                            note.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/50 hover:text-yellow-400"
                                        )}
                                    />
                                </button>
                            ) : (
                                note.is_favorite && <Star size={16} className="fill-yellow-400 text-yellow-400" />
                            )}
                        </div>

                        {interactive && (
                            <div className="absolute top-3 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-card shadow-sm border border-border rounded-md p-0.5">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite?.(note);
                                    }}
                                    className="p-1.5 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/40 rounded-sm transition-colors"
                                    title={note.is_favorite ? "Desfavoritar" : "Favoritar"}
                                >
                                    <Star size={14} className={note.is_favorite ? "fill-yellow-400 text-yellow-400" : ""} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit?.(note); }}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                                    title="Editar"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete?.(note.id); }}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {summary || <span className="italic opacity-50">Sem conteúdo...</span>}
                </p>
            </CardContent>

        </Card>
    );
}
