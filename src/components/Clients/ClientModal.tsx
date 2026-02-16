import React, { useState, useEffect } from 'react';
import { X, Save, Lock, User, Building2, KeyRound } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useEncryption } from '../../hooks/useEncryption';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    clientToEdit?: any; // We can type this better later
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
    const [loginCode, setLoginCode] = useState(''); // Cplug only
    const [systemLogin, setSystemLogin] = useState(''); // Cplug: User, Winfood: Operator Name?
    // Wait, requirement says:
    // Winfood: Nome, Operador
    // Cplug: Nome, Código Login, Usuário
    // I will map 'systemLogin' to 'Usuário' (Cplug) and maybe create a separate field for 'Operador' or reuse 'systemLogin' with a different label?
    // Let's create specific states to avoid confusion, and map them to DB columns on submit.
    // The DB has 'system_login'.

    const [operator, setOperator] = useState(''); // Winfood only
    const [password, setPassword] = useState('');
    const [cnpj, setCnpj] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (clientToEdit) {
                // Populate form
                setName(clientToEdit.name);
                setSystem(clientToEdit.system);
                setStatus(clientToEdit.status);
                setLoginCode(clientToEdit.login_code || '');
                setSystemLogin(clientToEdit.system_login || '');
                // We cannot decrypt the password for display usually, users set a new one if needed.
                // Or if we have decrypt, we could show it? 
                // Security wise, usually we don't show passwords. But this is a support system to STORE passwords.
                // So the user probably WANTS to see it. 
                // For now, let's leave password empty on edit unless they want to change it?
                // Or maybe decrypt it if we implement 'show password'. 
                // The task says "Cadastro/Edição". Let's focus on Create for now.
                // If editing, we keep the old password if this field is empty.
                setCnpj(clientToEdit.cnpj || '');

                // Construct operator if it was stored in system_login for winfood?
                // The DB schema in TECHNICAL.md has 'system_login'.
                // If winfood, 'system_login' might hold the operator name? 
                // Let's assume system_login is used for both 'Operator' (Winfood) and 'User' (Cplug).
                if (clientToEdit.system === 'winfood') {
                    setOperator(clientToEdit.system_login || '');
                } else {
                    setSystemLogin(clientToEdit.system_login || '');
                }

            } else {
                // Reset form
                setName('');
                setSystem('winfood');
                setStatus('implantation');
                setLoginCode('');
                setSystemLogin('');
                setOperator('');
                setPassword('');
                setCnpj('');
            }
        }
    }, [isOpen, clientToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("Usuário não autenticado");

            // Prepare Payload
            const payload: any = {
                user_id: user.id,
                name,
                system,
                status,
                cnpj,
                updated_at: new Date().toISOString(),
            };

            // Map fields based on system
            if (system === 'cplug') {
                payload.login_code = loginCode;
                payload.system_login = systemLogin;
            } else {
                // Winfood
                payload.system_login = operator; // Mapping Operator to system_login
            }

            // Encrypt Password if provided
            if (password) {
                payload.encrypted_password = encryptData(password);
            }

            let error;
            if (clientToEdit) {
                const { error: updateError } = await supabase
                    .from('clients')
                    .update(payload)
                    .eq('id', clientToEdit.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('clients')
                    .insert([payload]);
                error = insertError;
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    {/* System Selection */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setSystem('winfood')}
                            className={`p-2 text-sm font-medium rounded-md border transition-colors ${system === 'winfood'
                                    ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                        >
                            Winfood
                        </button>
                        <button
                            type="button"
                            onClick={() => setSystem('cplug')}
                            className={`p-2 text-sm font-medium rounded-md border transition-colors ${system === 'cplug'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                        >
                            Cplug
                        </button>
                    </div>

                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Cliente</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="Nome Fantasia"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ (Opcional)</label>
                            <input
                                type="text"
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operador</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={operator}
                                    onChange={(e) => setOperator(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Nome do Operador"
                                />
                            </div>
                        </div>
                    )}

                    {/* Conditional Fields: Cplug */}
                    {system === 'cplug' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cód. Login</label>
                                <input
                                    type="text"
                                    value={loginCode}
                                    onChange={(e) => setLoginCode(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Ex: 1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário</label>
                                <input
                                    type="text"
                                    value={systemLogin}
                                    onChange={(e) => setSystemLogin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Ex: admin"
                                />
                            </div>
                        </div>
                    )}

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {clientToEdit ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso'}
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text" // Using text to see the password while typing/copying. Could be 'password' but for support apps often text is preferred. Let's stick to text or toggle.
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                                placeholder={clientToEdit ? "******" : "Senha do Sistema"}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Lock size={12} />
                            Esta senha será criptografada no banco de dados.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {loading ? 'Salvando...' : 'Salvar Cliente'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
