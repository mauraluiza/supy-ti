import React, { useState, useEffect } from 'react';
import { Save, Lock, User, Building2, KeyRound } from 'lucide-react';
import { clientService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useEncryption } from '../hooks/useEncryption';
import { ClientIntegrations } from '../components/shared/ClientIntegrations';
import type { Integration } from '../types';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/modal';
import { Button } from '../components/ui/button';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    clientToEdit?: any;
}

export function ClientModal({ isOpen, onClose, onSuccess, clientToEdit }: ClientModalProps) {
    const { user } = useAuth();
    const { encryptData } = useEncryption();
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [system, setSystem] = useState<'winfood' | 'cplug'>('winfood');
    const [status, setStatus] = useState<'implantation' | 'active' | 'inactive'>('implantation');

    // Conditional Fields
    const [loginCode, setLoginCode] = useState('');
    const [systemLogin, setSystemLogin] = useState('');
    const [operator, setOperator] = useState('');
    const [password, setPassword] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [integrations, setIntegrations] = useState<Integration[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (clientToEdit) {
                setName(clientToEdit.name);
                setSystem(clientToEdit.system);
                setStatus(clientToEdit.status);
                setLoginCode(clientToEdit.login_code || '');
                setSystemLogin(clientToEdit.system_login || '');
                setCnpj(clientToEdit.cnpj || '');

                if (clientToEdit.system === 'winfood') {
                    setOperator(clientToEdit.system_login || '');
                } else {
                    setSystemLogin(clientToEdit.system_login || '');
                }

                setIntegrations(clientToEdit.integrations || []);

            } else {
                setName('');
                setSystem('winfood');
                setStatus('implantation');
                setLoginCode('');
                setSystemLogin('');
                setOperator('');
                setPassword('');
                setCnpj('');
                setIntegrations([]);
            }
        }
    }, [isOpen, clientToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("Usuário não autenticado");

            const payload: any = {
                user_id: user.id,
                name,
                system,
                status,
                cnpj,
                integrations,
            };

            if (system === 'cplug') {
                payload.login_code = loginCode;
                payload.system_login = systemLogin;
            } else {
                payload.system_login = operator;
            }

            if (password) {
                payload.encrypted_password = encryptData(password);
            }

            let error;
            if (clientToEdit) {
                // Update
                try {
                    await clientService.updateClient(clientToEdit.id, payload);
                } catch (e) {
                    error = e;
                }
            } else {
                // Create
                try {
                    await clientService.createClient(payload);
                } catch (e) {
                    error = e;
                }
            }

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert("Erro ao salvar cliente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width="lg"
        >
            <ModalHeader
                title={clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}
                description={clientToEdit ? 'Atualize as informações do cliente abaixo.' : 'Preencha os dados básicos e de acesso do novo cliente.'}
                onClose={onClose}
            />

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <ModalBody className="space-y-4">
                    {/* System Selection */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setSystem('winfood')}
                            className={`p-2 text-sm font-medium rounded-md border transition-colors ${system === 'winfood'
                                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                                : 'border-border text-muted-foreground hover:bg-muted dark:hover:bg-gray-800'
                                }`}
                        >
                            Winfood
                        </button>
                        <button
                            type="button"
                            onClick={() => setSystem('cplug')}
                            className={`p-2 text-sm font-medium rounded-md border transition-colors ${system === 'cplug'
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                : 'border-border text-muted-foreground hover:bg-muted dark:hover:bg-gray-800'
                                }`}
                        >
                            Cplug
                        </button>
                    </div>

                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nome do Cliente</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary font-medium"
                                placeholder="Nome Fantasia"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">CNPJ (Opcional)</label>
                            <input
                                type="text"
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                            >
                                <option value="implantation">Implantação</option>
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>
                    </div>

                    {/* Conditional Fields: Winfood */}
                    {system === 'winfood' && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Operador</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={operator}
                                    onChange={(e) => setOperator(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-foreground"
                                    placeholder="Nome do Operador"
                                />
                            </div>
                        </div>
                    )}

                    {/* Conditional Fields: Cplug */}
                    {system === 'cplug' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Cód. Login</label>
                                <input
                                    type="text"
                                    value={loginCode}
                                    onChange={(e) => setLoginCode(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                                    placeholder="Ex: 1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Usuário</label>
                                <input
                                    type="text"
                                    value={systemLogin}
                                    onChange={(e) => setSystemLogin(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                                    placeholder="Ex: admin"
                                />
                            </div>
                        </div>
                    )}

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {clientToEdit ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso'}
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-foreground font-mono"
                                placeholder={clientToEdit ? "******" : "Senha do Sistema"}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Lock size={12} />
                            Esta senha será criptografada no banco de dados.
                        </p>
                    </div>

                    {/* Integrations Section */}
                    <div className="pt-2">
                        <ClientIntegrations
                            integrations={integrations}
                            onChange={setIntegrations}
                        />
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="gap-2"
                    >
                        <Save size={16} />
                        {loading ? 'Salvando...' : 'Salvar Cliente'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
