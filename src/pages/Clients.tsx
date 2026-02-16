import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Client } from '../types';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { ClientModal } from '../components/Clients/ClientModal';
import { useEncryption } from '../hooks/useEncryption';

export function Clients() {
    const { decryptData } = useEncryption();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar clientes:', error);
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir');
        } else {
            fetchClients();
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingClient(undefined);
        setIsModalOpen(true);
    }

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.system_login?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Gerenciamento de Clientes
                    </h1>
                    <p className="text-gray-500 text-sm">Gerencie os acessos e informações dos clientes</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Novo Cliente
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Buscar por nome, usuário ou sistema..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Cliente / Sistema</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Acesso</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">Nenhum cliente encontrado.</td>
                                    </tr>
                                ) : (
                                    filteredClients.map(client => {
                                        // Visual Logic
                                        const isWinfood = client.system === 'winfood';

                                        // Background colors for the row or specific cells? 
                                        // Requirement: "Clientes Winfood: Fundo vermelho claro na tabela."
                                        // Requirement: "Clientes Cplug: Fundo azul claro na tabela."
                                        // Let's color the first cell or the whole row. Whole row is clearer but might be too intense if not subtle.
                                        // Let's try subtle background.

                                        const rowClass = isWinfood
                                            ? "bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20"
                                            : "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20";

                                        const badgeClass = isWinfood
                                            ? "bg-red-100 text-red-700 border-red-200"
                                            : "bg-blue-100 text-blue-700 border-blue-200";

                                        // Decrypt password (if needed to display, or just show placeholders)
                                        // Let's show the decrypted password for now as it's a support tool.
                                        const pass = client.encrypted_password ? decryptData(client.encrypted_password) : '---';

                                        return (
                                            <tr key={client.id} className={`transition-colors border-l-4 ${isWinfood ? 'border-l-red-400' : 'border-l-blue-400'} ${rowClass}`}>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white text-base">{client.name}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded border ${badgeClass} uppercase font-bold tracking-wide`}>
                                                            {client.system}
                                                        </span>
                                                        {client.cnpj && <span className="text-xs text-gray-500 font-mono">{client.cnpj}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {isWinfood ? (
                                                            <div className="text-sm">
                                                                <span className="text-gray-500">Operador:</span> <span className="font-medium">{client.system_login || '-'}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="text-sm">
                                                                    <span className="text-gray-500">Cód:</span> <span className="font-mono font-medium">{client.login_code || '-'}</span>
                                                                </div>
                                                                <div className="text-sm">
                                                                    <span className="text-gray-500">Usuário:</span> <span className="font-medium">{client.system_login || '-'}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="text-sm flex items-center gap-1 group cursor-pointer" title="Clique para copiar (futuro)">
                                                            <span className="text-gray-500">Senha:</span>
                                                            <span className="font-mono bg-white/50 dark:bg-black/20 px-1 rounded text-gray-700 dark:text-gray-300">
                                                                {pass}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {client.status === 'implantation' ? 'Implantação' :
                                                            client.status === 'active' ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(client)}
                                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-full transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(client.id)}
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-full transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchClients();
                }}
                clientToEdit={editingClient}
            />
        </div>
    );
}
