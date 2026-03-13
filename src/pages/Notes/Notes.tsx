import { useEffect, useState } from 'react';
import { noteService } from '../../services/supabase';
import type { Note } from '../../types';
import { StickyNote, Plus, Filter, ChevronDown, X } from 'lucide-react';
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
    const [filters, setFilters] = useState<{ search: string, favorite: boolean | null }>({
        search: '',
        favorite: null
    });
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
        const titleLower = note.title.toLowerCase();
        const searchLower = filters.search.toLowerCase();
        
        const matchesSearch = filters.search === "" || titleLower.includes(searchLower);
        
        let matchesFavorite = true;
        if (filters.favorite !== null) {
            matchesFavorite = note.is_favorite === filters.favorite;
        }

        return matchesSearch && matchesFavorite;
    });

    const activeFiltersCount = filters.favorite !== null ? 1 : 0;

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

            <div className="flex flex-col space-y-4">
                {/* Cabeçalho de Busca e Filtros */}
                <div className="flex flex-col space-y-2 pb-1">
                    <div className="flex items-center gap-2 relative">
                        <PageSearch
                            value={filters.search}
                            onChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
                            placeholder="Buscar por título da nota..."
                            className="flex-1 max-w-lg min-w-0 [&_input]:bg-white [&_input]:border-gray-200 shadow-sm"
                        />

                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="flex items-center gap-2"
                            >
                                <Filter size={16} />
                                {activeFiltersCount > 0 ? `Filtros (${activeFiltersCount})` : 'Filtros'}
                                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                            </Button>

                            {isFiltersOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-md border border-border bg-background p-4 shadow-lg z-10">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-sm mb-2 text-foreground">Status</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2 cursor-pointer text-sm">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer align-middle"
                                                        checked={filters.favorite === true}
                                                        onChange={(e) => {
                                                            setFilters(prev => ({
                                                                ...prev,
                                                                favorite: e.target.checked ? true : null
                                                            }));
                                                        }}
                                                    />
                                                    <span className="text-muted-foreground">Favoritos</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer text-sm">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer align-middle"
                                                        checked={filters.favorite === false}
                                                        onChange={(e) => {
                                                            setFilters(prev => ({
                                                                ...prev,
                                                                favorite: e.target.checked ? false : null
                                                            }));
                                                        }}
                                                    />
                                                    <span className="text-muted-foreground">Não favoritos</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {filters.favorite !== null && (
                                <span className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 transition-colors">
                                    Status: {filters.favorite ? 'Favoritos' : 'Não favoritos'}
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, favorite: null }))}
                                        className="text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors focus:outline-none ml-0.5"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                    <div className="text-sm text-gray-500">
                        {filteredNotes.length} {filteredNotes.length === 1 ? 'nota' : 'notas'}
                    </div>
                </div>

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
                                    description={(filters.search || filters.favorite !== null) ? "Não encontramos nada com esses filtros." : "Cadastre procedimentos e senhas para facilitar o dia a dia."}
                                    icon={StickyNote}
                                    action={
                                        (filters.search || filters.favorite !== null) && (
                                            <Button variant="outline" onClick={() => setFilters({ search: '', favorite: null })}>
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
