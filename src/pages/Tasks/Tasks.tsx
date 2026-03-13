import { useEffect, useState } from 'react';
import { taskService } from '../../services/supabase';
import type { Task } from '../../types';
import { CheckSquare, Plus, Filter, ChevronDown, X } from 'lucide-react';
import { TaskCard } from '../../components/shared/TaskCard';
import { TaskModal } from '../../modals/TaskModal';
import { Button } from '../../components/ui/button';
import { PageContainer } from '../../components/layout/page/PageContainer';
import { PageHeader } from '../../components/layout/page/PageHeader';
import { PageSearch } from '../../components/layout/page/PageSearch';
import { EmptyState } from '../../components/ui/empty-state';

type TaskFilters = {
    search: string;
    clients: string[];
    status: string[];
};

export function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<TaskFilters>({
        search: "",
        clients: [],
        status: []
    });
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await taskService.getTasks();

            // Sort frontend by priority: Urgent > In Progress > Pending > Done
            // But also consider date within same priority? For now just priority.
            const priorityMap = { urgent: 1, in_progress: 2, pending: 3, done: 4 };
            const sorted = (data || []).sort((a: any, b: any) => {
                const pA = priorityMap[a.status as keyof typeof priorityMap] || 99;
                const pB = priorityMap[b.status as keyof typeof priorityMap] || 99;
                if (pA !== pB) return pA - pB;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            setTasks(sorted as unknown as Task[]);
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleOpenNewTask = () => {
        setTaskToEdit(undefined);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleToggleTaskStatus = async (task: Task) => {
        try {
            if (task.status === 'done') {
                // Reabrir
                const newStatus = task.previous_status || 'pending';
                await taskService.updateTask(task.id, {
                    status: newStatus,
                    previous_status: null
                });
            } else {
                // Concluir
                await taskService.updateTask(task.id, {
                    status: 'done',
                    previous_status: task.status
                });
            }
            fetchTasks();
        } catch (error) {
            console.error("Erro ao alterar status da tarefa:", error);
            alert("Erro ao alterar status da tarefa.");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm("Certeza que deseja excluir esta tarefa?")) return;
        try {
            await taskService.deleteTask(taskId);
            fetchTasks();
        } catch (error) {
            console.error("Erro ao excluir tarefa:", error);
            alert("Erro ao excluir tarefa.");
        }
    };

    const handleModalSuccess = () => {
        fetchTasks();
        setIsModalOpen(false); // TaskModal handles its own close, but we ensure state sync here or if onSuccess doesn't close it automatically (TaskModal does close itself, but we should update list).
        // Actually TaskModal calls onSuccess then onClose.
    };

    // Unique clients for filter dropdown
    const availableClients = Array.from(new Set(tasks.map(t => t.client?.name).filter(Boolean))) as string[];

    // Filters
    const filteredTasks = tasks.filter(task => {
        const clientNameLower = (task.client?.name || '').toLowerCase();
        const titleLower = (task.title || '').toLowerCase();
        const searchLower = filters.search.toLowerCase();

        const matchesSearch = filters.search === "" || (
            clientNameLower.includes(searchLower) || titleLower.includes(searchLower)
        );

        const matchesClient = filters.clients.length === 0 || (task.client?.name && filters.clients.includes(task.client.name));
        const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);

        return matchesSearch && matchesClient && matchesStatus;
    });

    const activeFiltersCount = filters.clients.length + filters.status.length;

    return (
        <PageContainer>
            <PageHeader
                title="Gerenciamento de Tarefas"
                description="Organize e priorize o suporte aos clientes."
                icon={CheckSquare}
                action={
                    <Button onClick={handleOpenNewTask}>
                        <Plus size={16} className="mr-2" />
                        Nova Tarefa
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
                            placeholder="Buscar por título da tarefa ou cliente..."
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
                                        {availableClients.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-sm mb-2 text-foreground">Cliente</h4>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                    {availableClients.map(clientName => (
                                                        <label key={clientName} className="flex items-center space-x-2 cursor-pointer text-sm">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer align-middle"
                                                                checked={filters.clients.includes(clientName)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFilters(prev => ({ ...prev, clients: [...prev.clients, clientName] }));
                                                                    } else {
                                                                        setFilters(prev => ({ ...prev, clients: prev.clients.filter(c => c !== clientName) }));
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-muted-foreground truncate" title={clientName}>{clientName}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="font-medium text-sm mb-2 text-foreground">Status</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'Pendente', value: 'pending' },
                                                    { label: 'Em andamento', value: 'in_progress' },
                                                    { label: 'Concluída', value: 'done' },
                                                    { label: 'Urgente', value: 'urgent' }
                                                ].map(statusObj => (
                                                    <label key={statusObj.value} className="flex items-center space-x-2 cursor-pointer text-sm">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer align-middle"
                                                            checked={filters.status.includes(statusObj.value)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFilters(prev => ({ ...prev, status: [...prev.status, statusObj.value] }));
                                                                } else {
                                                                    setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== statusObj.value) }));
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-muted-foreground">{statusObj.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {filters.clients.map(clientName => (
                                <span key={clientName} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 transition-colors">
                                    Cliente: <span className="max-w-[100px] truncate" title={clientName}>{clientName}</span>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, clients: prev.clients.filter(c => c !== clientName) }))}
                                        className="text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors focus:outline-none ml-0.5"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            {filters.status.map(st => {
                                const label = st === 'pending' ? 'Pendente' : st === 'in_progress' ? 'Em andamento' : st === 'urgent' ? 'Urgente' : 'Concluída';
                                return (
                                    <span key={st} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 transition-colors">
                                        Status: {label}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== st) }))}
                                            className="text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors focus:outline-none ml-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                    <div className="text-sm text-gray-500">
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa' : 'tarefas'}
                    </div>
                </div>

                {/* Tasks Grid */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2 text-sm">Carregando tarefas...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTasks.length === 0 ? (
                            <div className="col-span-full">
                                <EmptyState
                                    title="Nenhuma tarefa encontrada"
                                    description={(activeFiltersCount > 0 || filters.search !== "") ? "Tente buscar por outro termo ou limpe o filtro." : "Você ainda não possui tarefas cadastradas."}
                                    icon={CheckSquare}
                                    action={
                                        (activeFiltersCount > 0 || filters.search !== "") ? (
                                            <Button variant="outline" onClick={() => setFilters({search: '', clients: [], status: []})}>
                                                Limpar Busca
                                            </Button>
                                        ) : (
                                            <Button variant="link" onClick={() => fetchTasks()}>
                                                Atualizar Lista
                                            </Button>
                                        )
                                    }
                                />
                            </div>
                        ) : (
                            filteredTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={handleEditTask}
                                    onDelete={handleDeleteTask}
                                    onToggleStatus={handleToggleTaskStatus}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                taskToEdit={taskToEdit}
            />
        </PageContainer>
    );
}
