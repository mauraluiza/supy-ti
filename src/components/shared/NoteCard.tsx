import { Star, Edit, Trash2 } from "lucide-react";
import type { Note } from "../../types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
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
            "relative overflow-hidden bg-card flex flex-col p-4 min-h-[120px] h-full justify-between",
            note.is_favorite ? "border-l-4 border-l-yellow-400" : "border-border",
            interactive ? "group hover:shadow-md transition-all cursor-pointer" : "cursor-default"
        )}>
            {/* Canto Superior Esquerdo - Badge Favorito */}
            {interactive ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(note);
                    }}
                    className={cn(
                        "absolute top-3 left-3 p-1 rounded-full transition-colors z-10",
                        note.is_favorite ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={note.is_favorite ? "Desfavoritar" : "Favoritar"}
                >
                    <Star size={14} className={note.is_favorite ? "fill-current" : ""} />
                </button>
            ) : (
                note.is_favorite && (
                    <div className="absolute top-3 left-3 p-1 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400 z-10">
                        <Star size={14} className="fill-current" />
                    </div>
                )
            )}

            {/* Canto Superior Direito - Data e Ações */}
            <div className="absolute top-3 right-4 flex items-center gap-1 z-10">
                <span className="text-xs text-muted-foreground whitespace-nowrap group-hover:opacity-0 transition-opacity translate-y-0.5">
                    {formatRelativeTime(note.updated_at || note.created_at)}
                </span>

                {interactive && (
                    <div className="absolute right-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-card shadow-sm border border-border rounded-md p-0.5">
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

            <CardHeader className="p-0 pb-2 pt-6 space-y-0 shrink-0">
                <CardTitle className="text-base font-semibold leading-tight text-foreground line-clamp-1 break-words">
                    {note.title}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {summary || <span className="italic opacity-50">Sem conteúdo...</span>}
                </p>
            </CardContent>

            {note.tags && note.tags.length > 0 && (
                <CardFooter className="p-0 mt-3 pt-2 shrink-0 flex gap-1 flex-wrap">
                    {note.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs px-2 py-0.5 rounded-md font-medium">
                            {tag}
                        </span>
                    ))}
                </CardFooter>
            )}
        </Card>
    );
}
