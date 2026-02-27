import { useEffect, useState } from 'react';
import { clientService } from '../../services/supabase';
import type { Client } from '../../types';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { ClientModal } from '../../modals/ClientModal';
import { useEncryption } from '../../hooks/useEncryption';
import { PageContainer } from '../../components/layout/page/PageContainer';
import { PageHeader } from '../../components/layout/page/PageHeader';
import { PageSearch } from '../../components/layout/page/PageSearch';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/empty-state';
import { getClientRowClass } from '../../lib/utils';

export function Clients() {
    const { decryptData } = useEncryption();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await clientService.getClients();
            setClients(data);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

        try {
            await clientService.deleteClient(id);
            fetchClients();
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir');
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
        <PageContainer>
            <PageHeader
                title="Gerenciamento de Clientes"
                description="Gerencie os acessos e dados dos clientes"
                icon={Users}
                action={
                    <Button onClick={handleNew}>
                        <Plus size={16} className="mr-2" />
                        Novo Cliente
                    </Button>
                }
            />

            <div className="flex flex-col space-y-4">
                <PageSearch
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar por nome, usuário ou sistema..."
                    totalResultCount={clients.length}
                    filteredResultCount={filteredClients.length}
                />

                {/* Table */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : (
                    <div className="rounded-md border border-border bg-background overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Cliente / Sistema</th>
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Acesso</th>
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="px-6 py-3 font-medium text-muted-foreground text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredClients.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-4">
                                                <EmptyState
                                                    title="Nenhum cliente encontrado"
                                                    description={searchTerm ? "Verifique a ortografia ou tente outro termo." : "Comece cadastrando seu primeiro cliente."}
                                                    icon={Users}
                                                    className="border-none bg-transparent" // Remove border since table already has it
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredClients.map(client => {
                                            // Badge Logic
                                            const isWinfood = client.system === 'winfood';
                                            const badgeClass = isWinfood
                                                ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                                                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800";

                                            const pass = client.encrypted_password ? decryptData(client.encrypted_password) : '---';

                                            return (
                                                <tr key={client.id} className={getClientRowClass(client)}>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-foreground text-base">{client.name}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs px-2 py-0.5 rounded border ${badgeClass} uppercase font-bold tracking-wide`}>
                                                                {client.system}
                                                            </span>
                                                            {client.cnpj && <span className="text-xs text-muted-foreground font-mono">{client.cnpj}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            {isWinfood ? (
                                                                <div className="text-sm">
                                                                    <span className="text-muted-foreground">Operador:</span> <span className="font-medium text-foreground">{client.system_login || '-'}</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="text-sm">
                                                                        <span className="text-muted-foreground">Cód:</span> <span className="font-mono font-medium text-foreground">{client.login_code || '-'}</span>
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        <span className="text-muted-foreground">Usuário:</span> <span className="font-medium text-foreground">{client.system_login || '-'}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                            <div className="text-sm flex items-center gap-1 group cursor-pointer" title="Clique para copiar (futuro)">
                                                                <span className="text-muted-foreground">Senha:</span>
                                                                <span className="font-mono bg-background px-1 rounded border border-border text-foreground text-xs">
                                                                    {pass}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${client.status === 'active' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                            client.status === 'inactive' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' :
                                                                'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                                            }`}>
                                                            {client.status === 'implantation' ? 'Implantação' :
                                                                client.status === 'active' ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEdit(client)}
                                                                className="h-8 w-8 p-0"
                                                                title="Editar"
                                                            >
                                                                <Edit size={16} />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(client.id)}
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                title="Excluir"
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
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
            </div>

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchClients();
                }}
                clientToEdit={editingClient}
            />
        </PageContainer>
    );
}
