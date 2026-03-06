import { useEffect, useState, useMemo } from 'react';
import { clientService } from '../../services/supabase';
import type { Client } from '../../types';
import { Plus, Edit, Trash2, Users, Filter, ChevronDown, X } from 'lucide-react';
import { ClientModal } from '../../modals/ClientModal';
import { useEncryption } from '../../hooks/useEncryption';
import { PageContainer } from '../../components/layout/page/PageContainer';
import { PageHeader } from '../../components/layout/page/PageHeader';
import { PageSearch } from '../../components/layout/page/PageSearch';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/empty-state';
import { getClientRowClass } from '../../lib/utils';

type ClientFilters = {
    search: string;
    systems: string[];
    status: string[];
};

export function Clients() {
    const { decryptData } = useEncryption();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ClientFilters>({
        search: "",
        systems: [],
        status: []
    });
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            // Text search
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = filters.search === "" || (
                client.name.toLowerCase().includes(searchLower) ||
                (client.system_login && client.system_login.toLowerCase().includes(searchLower)) ||
                (client.system && client.system.toLowerCase().includes(searchLower))
            );

            // System filter
            const matchesSystem = filters.systems.length === 0 || (client.system && filters.systems.includes(client.system));

            // Status filter
            const matchesStatus = filters.status.length === 0 || (client.status && filters.status.includes(client.status));

            return matchesSearch && matchesSystem && matchesStatus;
        });
    }, [clients, filters]);

    const activeFiltersCount = filters.systems.length + filters.status.length;

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredClients.slice(start, start + itemsPerPage);
    }, [filteredClients, currentPage]);

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

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
                {/* Cabeçalho de Busca e Filtros */}
                <div className="flex flex-col space-y-2 pb-1">
                    <div className="flex items-center gap-2 relative">
                        <PageSearch
                            value={filters.search}
                            onChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
                            placeholder="Buscar cliente..."
                            className="flex-1 max-w-lg min-w-0"
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
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-border bg-background p-4 shadow-lg z-10">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-sm mb-2 text-foreground">Sistema</h4>
                                            <div className="space-y-2">
                                                {['Winfood', 'CPlug'].map(sys => {
                                                    const sysLower = sys.toLowerCase();
                                                    return (
                                                        <label key={sys} className="flex items-center space-x-2 cursor-pointer text-sm">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer align-middle"
                                                                checked={filters.systems.includes(sysLower)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFilters(prev => ({ ...prev, systems: [...prev.systems, sysLower] }));
                                                                    } else {
                                                                        setFilters(prev => ({ ...prev, systems: prev.systems.filter(s => s !== sysLower) }));
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-muted-foreground">{sys}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-sm mb-2 text-foreground">Status</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'Ativo', value: 'active' },
                                                    { label: 'Implantação', value: 'implantation' },
                                                    { label: 'Inativo', value: 'inactive' }
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
                            {filters.systems.map(sys => {
                                const label = sys === 'winfood' ? 'Winfood' : sys === 'cplug' ? 'CPlug' : sys;
                                return (
                                    <span key={sys} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 transition-colors">
                                        Sistema: {label}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, systems: prev.systems.filter(s => s !== sys) }))}
                                            className="text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors focus:outline-none ml-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                );
                            })}
                            {filters.status.map(st => {
                                const label = st === 'active' ? 'Ativo' : st === 'implantation' ? 'Implantação' : st === 'inactive' ? 'Inativo' : st;
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
                        {filteredClients.length} {filteredClients.length === 1 ? 'cliente' : 'clientes'}
                    </div>
                </div>

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
                                        <th className="px-6 py-2.5 font-medium text-muted-foreground">Cliente / Sistema</th>
                                        <th className="px-6 py-2.5 font-medium text-muted-foreground">Acesso</th>
                                        <th className="px-6 py-2.5 font-medium text-muted-foreground">Status</th>
                                        <th className="px-6 py-2.5 font-medium text-muted-foreground text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredClients.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-4">
                                                <EmptyState
                                                    title="Nenhum cliente encontrado"
                                                    description={(activeFiltersCount > 0 || filters.search !== "") ? "Tente ajustar os filtros para encontrar o que procura." : "Comece cadastrando seu primeiro cliente."}
                                                    icon={Users}
                                                    className="border-none bg-transparent" // Remove border since table already has it
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedClients.map(client => {
                                            // Badge Logic
                                            const isWinfood = client.system === 'winfood';
                                            const badgeClass = isWinfood
                                                ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                                                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800";

                                            const pass = client.encrypted_password ? decryptData(client.encrypted_password) : '---';

                                            return (
                                                <tr key={client.id} className={getClientRowClass(client)}>
                                                    <td className="px-6 py-2.5 align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-foreground text-sm">{client.name}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badgeClass} uppercase font-bold tracking-wide`}>
                                                                {client.system}
                                                            </span>
                                                            {client.cnpj && <span className="text-xs text-muted-foreground font-mono ml-1">{client.cnpj}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-2.5 align-middle">
                                                        <div className="flex items-center gap-3 flex-wrap text-sm">
                                                            {isWinfood ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-muted-foreground">Operador:</span> <span className="font-medium text-foreground">{client.system_login || '-'}</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-muted-foreground">Cód:</span> <span className="font-mono font-medium text-foreground">{client.login_code || '-'}</span>
                                                                    </div>
                                                                    <span className="text-muted-foreground">•</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-muted-foreground">Usuário:</span> <span className="font-medium text-foreground">{client.system_login || '-'}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                            <span className="text-muted-foreground">•</span>
                                                            <div className="flex items-center gap-1 group cursor-pointer" title="Clique para copiar (futuro)">
                                                                <span className="text-muted-foreground">Senha:</span>
                                                                <span className="font-mono bg-background px-1 rounded border border-border text-foreground text-xs">
                                                                    {pass}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-2.5 align-middle">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${client.status === 'active' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                            client.status === 'inactive' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' :
                                                                'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                                            }`}>
                                                            {client.status === 'implantation' ? 'Implantação' :
                                                                client.status === 'active' ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-2.5 text-right align-middle">
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

                        {/* Paginação */}
                        {filteredClients.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border bg-muted/10 gap-4">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredClients.length)} de {filteredClients.length} clientes
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm font-medium px-4">
                                        {currentPage} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                    >
                                        Próximo
                                    </Button>
                                </div>
                            </div>
                        )}
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
