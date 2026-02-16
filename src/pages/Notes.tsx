import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Note } from '../types';
import { StickyNote, Plus } from 'lucide-react';
import { NoteCard } from '../components/Notes/NoteCard';
import { Button } from '../components/ui/button';
import { PageContainer } from '../components/Layout/Page/PageContainer';
import { PageHeader } from '../components/Layout/Page/PageHeader';
import { PageSearch } from '../components/Layout/Page/PageSearch';
import { EmptyState } from '../components/ui/empty-state';

export function Notes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNotes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('is_favorite', { ascending: false }) // Favoritos primeiro
            .order('updated_at', { ascending: false }); // Depois os mais recentes

        if (error) {
            console.error('Erro ao buscar notas:', error);
        } else {
            setNotes(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleToggleFavorite = async (note: Note) => {
        // Otimistic update
        const newStatus = !note.is_favorite;
        setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_favorite: newStatus } : n));

        const { error } = await supabase
            .from('notes')
            .update({ is_favorite: newStatus })
            .eq('id', note.id);

        if (error) {
            console.error("Erro ao favoritar:", error);
            fetchNotes(); // Revert on error
        } else {
            // Re-fetch to guarantee sort order if needed, or just let it stay until reload
            // Let's refetch to re-sort immediately? No, jarring. Keep current position until refresh or manual sort?
            // User requested: "Organização: Favoritos primeiro". If I toggle, it should jump to top?
            // Let's re-sort local state to reflect the requirement immediately.
            setNotes(prev => {
                const updated = prev.map(n => n.id === note.id ? { ...n, is_favorite: newStatus } : n);
                // Re-sort logic: Favoritos (true) > Não Favoritos (false), then Date Desc
                return updated.sort((a, b) => {
                    if (a.is_favorite === b.is_favorite) {
                        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                    }
                    return a.is_favorite ? -1 : 1;
                });
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;

        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) {
            alert("Erro ao excluir nota.");
        } else {
            fetchNotes(); // Refresh list
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
                title="Informações Gerais"
                description="Procedimentos, senhas padrão, links úteis e conhecimentos da equipe."
                icon={StickyNote}
                action={
                    <Button onClick={() => alert("Modal de Edição Rich Text na próxima etapa!")}>
                        <Plus size={16} className="mr-2" />
                        Nova Informação
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
                        <p className="text-muted-foreground mt-4 text-sm">Carregando informações...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.length === 0 ? (
                            <div className="col-span-full">
                                <EmptyState
                                    title="Nenhuma informação encontrada"
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
                                    onEdit={(n) => alert(`Editar nota: ${n.title} (Modal em breve)`)}
                                    onDelete={handleDelete}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
