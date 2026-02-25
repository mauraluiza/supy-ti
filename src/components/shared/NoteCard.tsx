import { Star, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Note } from "../../types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface NoteCardProps {
    note: Note;
    onEdit?: (note: Note) => void;
    onDelete?: (noteId: string) => void;
    onToggleFavorite?: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete, onToggleFavorite }: NoteCardProps) {

    // Função para limpar HTML do Rich Text e resumir
    const plainContent = note.content.replace(/<[^>]+>/g, ' ');
    const summary = plainContent.length > 120
        ? plainContent.substring(0, 120) + "..."
        : plainContent;

    return (
        <Card className="group hover:shadow-md transition-all cursor-pointer relative overflow-hidden bg-card border-border flex flex-col h-full">
            {/* Faixa lateral colorida se for favorito */}
            {note.is_favorite && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 z-10" />
            )}

            <CardHeader className="pb-2 space-y-0">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold leading-tight text-foreground line-clamp-2">
                        {note.title}
                    </CardTitle>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite?.(note);
                        }}
                        className="text-muted-foreground hover:text-yellow-500 transition-colors focus:outline-none"
                    >
                        <Star
                            size={18}
                            className={cn(
                                "transition-all",
                                note.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/50 hover:text-yellow-400"
                            )}
                        />
                    </button>
                </div>
                <span className="text-xs text-muted-foreground block mt-1">
                    Atualizado {formatDistanceToNow(new Date(note.updated_at || note.created_at), { addSuffix: true, locale: ptBR })}
                </span>
            </CardHeader>

            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed whitespace-pre-wrap">
                    {summary || <span className="italic opacity-50">Sem conteúdo...</span>}
                </p>
            </CardContent>

            <CardFooter className="pt-2 pb-4 px-6 border-t border-border/50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(note);
                    }}
                    title="Editar"
                >
                    <Edit size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(note.id);
                    }}
                    title="Excluir"
                >
                    <Trash2 size={16} />
                </Button>
            </CardFooter>
        </Card>
    );
}
