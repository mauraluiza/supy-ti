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
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Users size={20} className="text-blue-500" />
                        Clientes Recentes
                    </h2>
                    <button className="text-sm text-blue-400 hover:text-blue-300">Ver todos</button>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3">Sistema</th>
                                    <th className="px-6 py-3">Nome</th>
                                    <th className="px-6 py-3">Login Code</th>
                                    <th className="px-6 py-3">Usuário</th>
                                    <th className="px-6 py-3">Senha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {MOCK_CLIENTS.map((client) => {
                                    const isCplug = client.system === 'cplug';
                                    return (
                                        <tr
                                            key={client.id}
                                            className={clsx(
                                                "transition-colors hover:bg-gray-700/30 cursor-pointer",
                                                isCplug ? "bg-blue-900/10" : "bg-red-900/10"
                                            )}
                                        >
                                            <td className={clsx("px-6 py-4 font-medium", isCplug ? "text-blue-400" : "text-red-400")}>
                                                {client.system?.toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                                            <td className="px-6 py-4 text-gray-400">{client.login_code || '-'}</td>
                                            <td className="px-6 py-4 text-gray-300">{client.system_login}</td>
                                            <td className="px-6 py-4 font-mono text-gray-500">******</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 2: TAREFAS */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Clock size={20} className="text-orange-500" />
                        Tarefas Recentes
                    </h2>
                    <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-800 rounded text-gray-400"><ArrowRight size={16} /></button>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {MOCK_TASKS.map((task) => (
                        <div
                            key={task.id}
                            className="snap-start min-w-[280px] md:min-w-[320px] bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm flex flex-col gap-3 hover:border-gray-600 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-400 truncate max-w-[180px]">
                                    {task.client?.name}
                                </span>
                                <StatusBadge status={task.status} />
                            </div>
                            <p className="text-white font-medium line-clamp-2 mt-1">
                                {task.description}
                            </p>
                            <div className="mt-auto pt-3 text-xs text-gray-500 flex justify-between items-center border-t border-gray-700/50">
                                <span>Há 2 horas</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">Ver detalhes →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SEÇÃO 3: INFO GERAIS */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Star size={20} className="text-yellow-500" />
                        Informações Rápidas
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_NOTES.map((note) => (
                        <div
                            key={note.id}
                            className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-medium">{note.title}</h3>
                                {note.is_favorite && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-3">
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
