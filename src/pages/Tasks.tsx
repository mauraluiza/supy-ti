import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Task } from '../types';
import { CheckSquare, Plus } from 'lucide-react';
import { TaskCard } from '../components/Tasks/TaskCard';
import { Button } from '../components/ui/button';
import { PageContainer } from '../components/Layout/Page/PageContainer';
import { PageHeader } from '../components/Layout/Page/PageHeader';
import { PageSearch } from '../components/Layout/Page/PageSearch';
import { EmptyState } from '../components/ui/empty-state';

export function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTasks = async () => {
        setLoading(true);
        // We select *, and join 'client' table to get name and system.
        // The type definition for Task interface should support this join or we map "any" temporarily.
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                client:clients (
                    id,
                    name,
                    system
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar tarefas:', error);
        } else {
            // Sort frontend by priority: Urgent > In Progress > Pending > Done
            const priorityMap = { urgent: 1, in_progress: 2, pending: 3, done: 4 };
            const sorted = (data || []).sort((a: any, b: any) => {
                const pA = priorityMap[a.status as keyof typeof priorityMap] || 99;
                const pB = priorityMap[b.status as keyof typeof priorityMap] || 99;
                return pA - pB;
            });
            setTasks(sorted as unknown as Task[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

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
                    <Button onClick={() => alert("Modal de Nova Tarefa será implementado na próxima etapa!")}>
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
                                    onEdit={(t) => alert(`Editar tarefa do cliente: ${t.client?.name} (Modal em breve)`)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
