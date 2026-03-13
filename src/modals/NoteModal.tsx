import React, { useState, useEffect } from 'react';
import { Save, Trash2, AlertCircle, Star, X } from 'lucide-react';
import { noteService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Note } from '../types';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/modal';
import { Button } from '../components/ui/button';
import { RichTextEditor } from '../components/ui/rich-text-editor';
import { cn } from '../lib/utils';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    noteToEdit?: Note;
}

export function NoteModal({ isOpen, onClose, onSuccess, noteToEdit }: NoteModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Delete Confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Populate Form
    useEffect(() => {
        if (isOpen) {
            if (noteToEdit) {
                setTitle(noteToEdit.title);
                setContent(noteToEdit.content);
                setIsFavorite(noteToEdit.is_favorite);
                setTags(noteToEdit.tags || []);
            } else {
                // Reset
                setTitle('');
                setContent('');
                setIsFavorite(false);
                setTags([]);
            }
            setTagInput('');
            setShowDeleteConfirm(false);
        }
    }, [isOpen, noteToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("Usuário não autenticado");
            if (!title.trim()) throw new Error("Título é obrigatório");
            if (!content.trim()) throw new Error("Conteúdo é obrigatório");

            const payload = {
                user_id: user.id,
                title,
                content,
                is_favorite: isFavorite,
                tags
            };

            if (noteToEdit) {
                await noteService.updateNote(noteToEdit.id, payload);
            } else {
                await noteService.createNote(payload as any);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar nota:", error);
            alert("Erro ao salvar nota: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!noteToEdit) return;
        setLoading(true);
        try {
            await noteService.deleteNote(noteToEdit.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir nota.");
        } finally {
            setLoading(false);
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !tags.includes(val)) {
                setTags([...tags, val]);
                setTagInput('');
            }
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} width="lg">
            <ModalHeader
                title={noteToEdit ? 'Editar Nota' : 'Nova Nota'}
                description={noteToEdit ? 'Edite os detalhes da anotação.' : 'Crie uma nova nota ou procedimento geral.'}
                onClose={onClose}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="h-8 w-8 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 mr-1"
                    title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                    <Star
                        className={cn(
                            "h-5 w-5 transition-colors",
                            isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        )}
                    />
                </Button>
            </ModalHeader>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <ModalBody className="space-y-4">

                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Título <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary font-medium text-lg"
                            placeholder="Ex: Senhas de Wifi, Procedimento de Reboot..."
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Tags <span className="text-muted-foreground font-normal">(pressione Enter para adicionar)</span>
                        </label>
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary sm:text-sm"
                                placeholder="Ex: Servidor, Acesso, TEF..."
                            />
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-2.5 py-1 rounded-md font-medium">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="text-gray-400 hover:text-red-500 focus:outline-none"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Editor Rico */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Descrição <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 min-h-[300px]">
                            <RichTextEditor
                                content={content}
                                onChange={setContent}
                                placeholder="Descreva os detalhes da nota aqui..."
                                className="h-full flex flex-col"
                            />
                        </div>
                    </div>

                    {/* Exclusão */}
                    {showDeleteConfirm && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md animate-in slide-in-from-top-2">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Confirmar exclusão?</h4>
                                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                                        Esta ação removerá permanentemente esta nota.
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="text-red-700 hover:text-red-800 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                                        >
                                            Sim, excluir
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </ModalBody>

                <ModalFooter className="justify-between">
                    <div>
                        {noteToEdit && !showDeleteConfirm && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Excluir
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="gap-2"
                        >
                            <Save size={16} />
                            {loading ? 'Salvando...' : 'Salvar Nota'}
                        </Button>
                    </div>
                </ModalFooter>
            </form>
        </Modal>
    );
}
