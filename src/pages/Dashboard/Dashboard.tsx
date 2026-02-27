import { useEffect, useState } from 'react';
import { Users, Clock, Star } from 'lucide-react';
import { clientService, taskService, noteService } from '../../services/supabase';
import { DashboardSectionHeader } from '../../components/shared/DashboardSectionHeader';
import { TaskCard } from '../../components/shared/TaskCard';
import { NoteCard } from '../../components/shared/NoteCard';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { getClientRowClass } from '../../lib/utils';
import type { Client, Task, Note } from '../../types';

export function Dashboard() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHoveringTable, setIsHoveringTable] = useState(false);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

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

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Consider scrolled to bottom if within 5px of the end
        if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - 5) {
            setIsScrolledToBottom(true);
        } else {
            setIsScrolledToBottom(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:h-full lg:overflow-y-hidden">

            {/* SEÇÃO 1: CLIENTES RECENTES */}
            <section className="space-y-3">
                <DashboardSectionHeader
                    title="Clientes Recentes"
                    icon={<Users size={18} className="text-primary" />}
                    navigateTo="/clients"
                />

                <div
                    className="rounded-lg border border-border bg-card text-card-foreground shadow-sm flex flex-col relative"
                    onMouseEnter={() => setIsHoveringTable(true)}
                    onMouseLeave={() => setIsHoveringTable(false)}
                >
                    <div
                        className="overflow-x-auto overflow-y-auto max-h-[170px] relative border-b border-border/50"
                        onScroll={handleScroll}
                    >
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/95 border-b border-border sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Sistema</th>
                                    <th className="px-4 py-2 font-medium">Nome</th>
                                    <th className="px-4 py-2 font-medium">Login Code</th>
                                    <th className="px-4 py-2 font-medium">Usuário</th>
                                    <th className="px-4 py-2 font-medium">Senha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">
                                            Nenhum cliente cadastrado.
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client) => {
                                        const isCplug = client.system === 'cplug';
                                        return (
                                            <tr
                                                key={client.id}
                                                className={getClientRowClass(client)}
                                            >
                                                <td className="px-4 py-3">
                                                    <span className={clsx(
                                                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                                                        isCplug
                                                            ? "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30"
                                                            : "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/30"
                                                    )}>
                                                        {client.system?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{client.login_code || '-'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{client.system_login}</td>
                                                <td className="px-4 py-3 font-mono text-muted-foreground">******</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Gradient Overlay for Scroll Indication */}
                    {clients.length > 3 && (
                        <div
                            className={clsx(
                                "absolute bottom-12 left-0 w-full h-16 pointer-events-none transition-opacity duration-300 bg-gradient-to-t from-card to-transparent",
                                (isHoveringTable || isScrolledToBottom) ? "opacity-0" : "opacity-100"
                            )}
                        />
                    )}

                    {clients.length > 0 && (
                        <div className="bg-muted/30 p-2 flex justify-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/clients')}
                                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors h-8"
                            >
                                Ver todos os clientes
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* SEÇÃO 2: TAREFAS */}
            <section className="space-y-3">
                <DashboardSectionHeader
                    title="Tarefas Recentes"
                    icon={<Clock size={18} className="text-orange-500" />}
                    navigateTo="/tasks"
                />

                {/* Horizontal Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                    {tasks.length === 0 ? (
                        <div className="w-full text-center py-4 text-muted-foreground border border-dashed border-border rounded-lg">
                            Nenhuma tarefa pendente.
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="snap-start min-w-[280px] md:min-w-[320px] max-w-[320px] flex-shrink-0">
                                <TaskCard task={task} interactive={false} />
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* SEÇÃO 3: NOTAS RÁPIDAS */}
            <section className="space-y-3">
                <DashboardSectionHeader
                    title="Notas Rápidas"
                    icon={<Star size={18} className="text-yellow-500" />}
                    navigateTo="/notes"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.length === 0 ? (
                        <div className="col-span-full text-center py-4 text-muted-foreground border border-dashed border-border rounded-lg">
                            Nenhuma nota cadastrada.
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="h-full">
                                <NoteCard note={note} interactive={false} />
                            </div>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}
