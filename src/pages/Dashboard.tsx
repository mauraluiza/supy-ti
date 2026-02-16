import { Users, Clock, Star, ArrowRight } from 'lucide-react';

import clsx from 'clsx';
import type { Client, Task, Note } from '../types';

// Mock Data for initial UI check
const MOCK_CLIENTS: Partial<Client>[] = [
    { id: '1', name: 'Restaurante Sabor & Arte', system: 'winfood', status: 'implantation', system_login: 'Caixa 1', login_code: '-', created_at: new Date().toISOString() },
    { id: '2', name: 'Burger King Centro', system: 'cplug', status: 'active', system_login: 'gerente', login_code: '8821', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', name: 'Pizzaria Don Pepe', system: 'winfood', status: 'inactive', system_login: 'admin', login_code: '-', created_at: new Date(Date.now() - 172800000).toISOString() },
];

const MOCK_TASKS: Partial<Task>[] = [
    { id: '1', description: 'Configurar impressora fiscal', status: 'urgent', client: { name: 'Restaurante Sabor & Arte' } as Client },
    { id: '2', description: 'Reinstalar sistema no caixa 2', status: 'in_progress', client: { name: 'Burger King Centro' } as Client },
    { id: '3', description: 'Treinamento de menu digital', status: 'pending', client: { name: 'Pizzaria Don Pepe' } as Client },
    { id: '4', description: 'Backup mensal', status: 'done', client: { name: 'Padaria Estrela' } as Client },
];

const MOCK_NOTES: Partial<Note>[] = [
    { id: '1', title: 'Senhas Padrão', content: 'Winfood: 121012, Cplug: 121412', is_favorite: true, created_at: new Date().toISOString() },
    { id: '2', title: 'Link Anydesk', content: 'Versão 7.1 recomendada', is_favorite: false, created_at: new Date().toISOString() },
];

export function Dashboard() {
    return (
        <div className="space-y-8 pb-20">

            {/* SEÇÃO 1: CLIENTES RECENTES */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 tracking-tight">
                        <Users size={20} className="text-primary" />
                        Clientes Recentes
                    </h2>
                    <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Ver todos</button>
                </div>

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
                                {MOCK_CLIENTS.map((client) => {
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
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 2: TAREFAS */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 tracking-tight">
                        <Clock size={20} className="text-orange-500" />
                        Tarefas Recentes
                    </h2>
                    <div className="flex gap-2">
                        <button className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"><ArrowRight size={16} /></button>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {MOCK_TASKS.map((task) => (
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
                            <p className="text-card-foreground font-medium line-clamp-2 mt-1 leading-snug">
                                {task.description}
                            </p>
                            <div className="mt-auto pt-3 text-xs text-muted-foreground flex justify-between items-center border-t border-border">
                                <span>Há 2 horas</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium">Ver detalhes →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SEÇÃO 3: INFO GERAIS */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 tracking-tight">
                        <Star size={20} className="text-yellow-500" />
                        Informações Rápidas
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_NOTES.map((note) => (
                        <div
                            key={note.id}
                            className="bg-card p-5 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer shadow-sm group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-card-foreground font-semibold tracking-tight">{note.title}</h3>
                                {note.is_favorite && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {note.content}
                            </p>
                        </div>
                    ))}
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
