import { useEffect, useState } from 'react';
import { noteService } from '../../services/supabase';
import type { Note } from '../../types';
import { StickyNote, Plus } from 'lucide-react';
import { NoteCard } from '../../components/shared/NoteCard';
import { Button } from '../../components/ui/button';
import { PageContainer } from '../../components/layout/page/PageContainer';
import { PageHeader } from '../../components/layout/page/PageHeader';
import { PageSearch } from '../../components/layout/page/PageSearch';
import { EmptyState } from '../../components/ui/empty-state';
import { NoteModal } from '../../modals/NoteModal';

export function Notes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<Note | undefined>(undefined);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const data = await noteService.getNotes();
            setNotes(data);
        } catch (error) {
            console.error('Erro ao buscar notas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleOpenNewNote = () => {
        setNoteToEdit(undefined);
        setIsModalOpen(true);
    };

    const handleEditNote = (note: Note) => {
        setNoteToEdit(note);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchNotes();
        setIsModalOpen(false);
    };

    const handleToggleFavorite = async (note: Note) => {
        // Optimistic update for immediate feedback
        const newStatus = !note.is_favorite;
        setNotes(prev => {
            const updated = prev.map(n => n.id === note.id ? { ...n, is_favorite: newStatus } : n);
            // Re-sort logic: Favoritos (true) > Não Favoritos (false), then Date Desc
            return updated.sort((a, b) => {
                // If favorite status differs, favorite comes first (-1)
                if (a.is_favorite !== b.is_favorite) {
                    return a.is_favorite ? -1 : 1;
                }
                // If same status, sort by date desc
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            });
        });

        try {
            await noteService.updateNote(note.id, { is_favorite: newStatus });
        } catch (error) {
            console.error("Erro ao favoritar:", error);
            fetchNotes(); // Revert on error
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;

        try {
            await noteService.deleteNote(id);
            fetchNotes();
        } catch (error) {
            alert("Erro ao excluir nota.");
        }
    };

    // Filter Logic
    const filteredNotes = notes.filter(note => {
        const search = searchTerm.toLowerCase();
        return (
            note.title.toLowerCase().includes(search) ||
            (note.content && note.content.toLowerCase().includes(search))
        );
    });

    return (
        <PageContainer>
            <PageHeader
                title="Notas"
                description="Procedimentos, senhas padrão, links úteis e conhecimentos da equipe."
                icon={StickyNote}
                action={
                    <Button onClick={handleOpenNewNote}>
                        <Plus size={16} className="mr-2" />
                        Nova Nota
                    </Button>
                }
            />

            <div className="flex flex-col space-y-6">
                <PageSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar por título ou conteúdo..."
                    totalResultCount={notes.length}
                    filteredResultCount={filteredNotes.length}
                />

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-4 text-sm">Carregando notas...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.length === 0 ? (
                            <div className="col-span-full">
                                <EmptyState
                                    title="Nenhuma nota encontrada"
                                    description={searchTerm ? "Não encontramos nada com esse termo." : "Cadastre procedimentos e senhas para facilitar o dia a dia."}
                                    icon={StickyNote}
                                    action={
                                        searchTerm && (
                                            <Button variant="outline" onClick={() => setSearchTerm('')}>
                                                Limpar Filtros
                                            </Button>
                                        )
                                    }
                                />
                            </div>
                        ) : (
                            filteredNotes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onEdit={handleEditNote}
                                    onDelete={handleDelete}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            <NoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                noteToEdit={noteToEdit}
            />
        </PageContainer>
    );
}
