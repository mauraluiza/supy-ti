import { useEffect, useState } from 'react';
import { taskService } from '../../services/supabase';
import type { Task } from '../../types';
import { CheckSquare, Plus } from 'lucide-react';
import { TaskCard } from '../../components/shared/TaskCard';
import { TaskModal } from '../../modals/TaskModal';
import { Button } from '../../components/ui/button';
import { PageContainer } from '../../components/layout/page/PageContainer';
import { PageHeader } from '../../components/layout/page/PageHeader';
import { PageSearch } from '../../components/layout/page/PageSearch';
import { EmptyState } from '../../components/ui/empty-state';

export function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleModalSuccess = () => {
        fetchTasks();
        setIsModalOpen(false); // TaskModal handles its own close, but we ensure state sync here or if onSuccess doesn't close it automatically (TaskModal does close itself, but we should update list).
        // Actually TaskModal calls onSuccess then onClose.
    };

    // Filters
    const filteredTasks = tasks.filter(task => {
        const clientName = task.client?.name || '';
        const search = searchTerm.toLowerCase();
        return clientName.toLowerCase().includes(search);
    });

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
                <PageSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar tarefas por cliente..."
                    totalResultCount={tasks.length}
                    filteredResultCount={filteredTasks.length}
                />

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
                                    description={searchTerm ? "Tente buscar por outro termo ou limpe o filtro." : "Você ainda não possui tarefas cadastradas."}
                                    icon={CheckSquare}
                                    action={
                                        searchTerm ? (
                                            <Button variant="outline" onClick={() => setSearchTerm('')}>
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
