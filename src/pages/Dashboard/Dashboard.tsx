import { useEffect, useState } from 'react';
import { Users, Clock, Star } from 'lucide-react';
import { clientService, taskService, noteService } from '../../services/supabase';
import { DashboardSectionHeader } from '../../components/shared/DashboardSectionHeader';
import clsx from 'clsx';
import type { Client, Task, Note } from '../../types';

export function Dashboard() {
    const [clients, setClients] = useState<Client[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [clientsData, tasksData, notesData] = await Promise.all([
                    clientService.getClients(),
                    taskService.getTasks(),
                    noteService.getNotes()
                ]);

                // Limit for dashboard display
                setClients(clientsData.slice(0, 5));
                setTasks(tasksData.slice(0, 5));
                setNotes(notesData.slice(0, 3));
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">

            {/* SEÇÃO 1: CLIENTES RECENTES */}
            <section className="space-y-4">
                <DashboardSectionHeader
                    title="Clientes Recentes"
                    icon={<Users size={20} className="text-primary" />}
                    navigateTo="/clients"
                />

                <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Sistema</th>
                                    <th className="px-6 py-3 font-medium">Nome</th>
                                    <th className="px-6 py-3 font-medium">Login Code</th>
                                    <th className="px-6 py-3 font-medium">Usuário</th>
                                    <th className="px-6 py-3 font-medium">Senha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                                            Nenhum cliente cadastrado.
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client) => {
                                        const isCplug = client.system === 'cplug';
                                        return (
                                            <tr
                                                key={client.id}
                                                className={clsx(
                                                    "transition-colors hover:bg-muted/50 cursor-pointer",
                                                    isCplug ? "dark:bg-blue-950/10" : "dark:bg-red-950/10"
                                                )}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className={clsx(
                                                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                                        isCplug
                                                            ? "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30"
                                                            : "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/30"
                                                    )}>
                                                        {client.system?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-foreground">{client.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{client.login_code || '-'}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{client.system_login}</td>
                                                <td className="px-6 py-4 font-mono text-muted-foreground">******</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 2: TAREFAS */}
            <section className="space-y-4">
                <DashboardSectionHeader
                    title="Tarefas Recentes"
                    icon={<Clock size={20} className="text-orange-500" />}
                    navigateTo="/tasks"
                />

                {/* Horizontal Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {tasks.length === 0 ? (
                        <div className="w-full text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
                            Nenhuma tarefa pendente.
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="snap-start min-w-[280px] md:min-w-[320px] bg-card p-5 rounded-lg border border-border shadow-sm flex flex-col gap-3 hover:border-primary/50 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-muted-foreground truncate max-w-[180px]">
                                        {task.client?.name}
                                    </span>
                                    <StatusBadge status={task.status} />
                                </div>
                                <div className="text-card-foreground font-medium line-clamp-2 mt-1 leading-snug prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: task.description }} />

                                <div className="mt-auto pt-3 text-xs text-muted-foreground flex justify-between items-center border-t border-border">
                                    <span>{new Date(task.created_at).toLocaleDateString()}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium">Ver detalhes →</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* SEÇÃO 3: INFO GERAIS */}
            <section className="space-y-4">
                <DashboardSectionHeader
                    title="Informações Rápidas"
                    icon={<Star size={20} className="text-yellow-500" />}
                    navigateTo="/notes"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.length === 0 ? (
                        <div className="col-span-full text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
                            Nenhuma informação cadastrada.
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="bg-card p-5 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer shadow-sm group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-card-foreground font-semibold tracking-tight">{note.title}</h3>
                                    {note.is_favorite && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                                </div>
                                <div className="text-sm text-muted-foreground line-clamp-3 leading-relaxed prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: note.content }} />
                            </div>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}

// Helper para Badge colorido
function StatusBadge({ status }: { status?: string }) {
    const styles = {
        urgent: "bg-red-500/10 text-red-500",
        in_progress: "bg-orange-500/10 text-orange-500",
        pending: "bg-yellow-500/10 text-yellow-500",
        done: "bg-green-500/10 text-green-500",
    };

    const labels = {
        urgent: "Urgente",
        in_progress: "Em Andamento",
        pending: "Pendente",
        done: "Concluído",
    };

    const key = status as keyof typeof styles;

    return (
        <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium border border-transparent", styles[key])}>
            {labels[key]}
        </span>
    );
}
