import React, { useState, useEffect } from 'react';
import { Save, Trash2, AlertCircle } from 'lucide-react';
import { taskService, clientService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Task } from '../types';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/modal';
import { Button } from '../components/ui/button';
import { RichTextEditor } from '../components/ui/rich-text-editor';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    taskToEdit?: Task;
}

export function TaskModal({ isOpen, onClose, onSuccess, taskToEdit }: TaskModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<{ id: string, name: string }[]>([]);
    const [clientsLoading, setClientsLoading] = useState(false);

    // Form States
    const [clientId, setClientId] = useState('');
    const [status, setStatus] = useState<'urgent' | 'in_progress' | 'pending' | 'done'>('pending');
    const [description, setDescription] = useState('');

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Load Clients
    useEffect(() => {
        if (isOpen) {
            const fetchClients = async () => {
                setClientsLoading(true);
                try {
                    const data = await clientService.getClients();
                    setClients(data.map(c => ({ id: c.id, name: c.name })));
                } catch (error) {
                    console.error("Erro ao carregar clientes", error);
                } finally {
                    setClientsLoading(false);
                }
            };
            fetchClients();
        }
    }, [isOpen]);

    // Populate Form
    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setClientId(taskToEdit.client_id || '');
                setStatus(taskToEdit.status);
                setDescription(taskToEdit.description || '');
            } else {
                // Reset
                setClientId('');
                setStatus('pending');
                setDescription('');
            }
            setShowDeleteConfirm(false);
        }
    }, [isOpen, taskToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("Usuário não autenticado");
            if (!clientId) throw new Error("Cliente é obrigatório");
            if (!description) throw new Error("Descrição é obrigatória");

            const payload = {
                user_id: user.id,
                client_id: clientId,
                status,
                description,
            };

            if (taskToEdit) {
                await taskService.updateTask(taskToEdit.id, payload);
            } else {
                await taskService.createTask(payload as any);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar tarefa:", error);
            alert("Erro ao salvar tarefa: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!taskToEdit) return;
        setLoading(true);
        try {
            await taskService.deleteTask(taskToEdit.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir tarefa.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} width="lg">
            <ModalHeader
                title={taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
                description={taskToEdit ? 'Edite os detalhes da tarefa e seu status atual.' : 'Crie uma nova tarefa selecionando o cliente e descrevendo a demanda.'}
                onClose={onClose}
            />

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <ModalBody className="space-y-4">

                    {/* Linha 1: Cliente e Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Cliente <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                disabled={clientsLoading}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary sm:text-sm"
                            >
                                <option value="">Selecione um cliente...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary sm:text-sm"
                            >
                                <option value="pending">Não Iniciada</option>
                                <option value="in_progress">Em Andamento</option>
                                <option value="urgent">Urgente</option>
                                <option value="done">Concluída</option>
                            </select>
                        </div>
                    </div>

                    {/* Linha 2: Descrição Rica */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Descrição <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 min-h-[200px]">
                            <RichTextEditor
                                content={description}
                                onChange={setDescription}
                                placeholder="Descreva detalhadamente a tarefa. Use markdown ou as ferramentas acima para listas e destaques."
                                className="h-full flex flex-col"
                            />
                        </div>
                    </div>

                    {/* Área de Confirmação de Exclusão (Se ativo) */}
                    {showDeleteConfirm && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md animate-in slide-in-from-top-2">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Confirmar exclusão?</h4>
                                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                                        Esta ação não pode ser desfeita.
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
                    {/* Lado Esquerdo: Botão Excluir (Só edição) */}
                    <div>
                        {taskToEdit && !showDeleteConfirm && (
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

                    {/* Lado Direito: Ações Principais */}
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
                            {loading ? 'Salvando...' : 'Salvar Tarefa'}
                        </Button>
                    </div>
                </ModalFooter>
            </form>
        </Modal>
    );
}
