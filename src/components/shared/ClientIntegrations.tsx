import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Monitor, Utensils, Receipt, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../utils/utils';
import type { Integration, IntegrationType, AnydeskIntegration, IfoodIntegration, AnotaAiIntegration } from '../../types';

interface ClientIntegrationsProps {
    integrations: Integration[];
    onChange: (integrations: Integration[]) => void;
}

export function ClientIntegrations({ integrations, onChange }: ClientIntegrationsProps) {
    const [activeTab, setActiveTab] = useState<IntegrationType | null>(null);

    const handleAdd = (type: IntegrationType) => {
        const newIntegration: Integration = {
            id: uuidv4(),
            type,
            ...(type === 'anydesk' ? { access: '', password: '' } :
                type === 'ifood' ? { username: '', password: '' } :
                    { email: '', password: '' })
        } as Integration;

        onChange([...integrations, newIntegration]);
    };

    const handleRemove = (id: string) => {
        onChange(integrations.filter(i => i.id !== id));
    };

    const handleUpdate = (id: string, field: string, value: string) => {
        onChange(integrations.map(i => {
            if (i.id === id) {
                return { ...i, [field]: value } as Integration;
            }
            return i;
        }));
    };

    const toggleTab = (tab: IntegrationType) => {
        setActiveTab(activeTab === tab ? null : tab);
    };

    // Filter integrations by active type for rendering
    const activeIntegrations = integrations.filter(i => i.type === activeTab);

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
            <h3 className="text-sm font-medium text-foreground mb-2">Integrações (Opcionais)</h3>

            {/* Tab Selector */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={activeTab === 'anydesk' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTab('anydesk')}
                    className={cn("flex-1", activeTab === 'anydesk' ? "ring-2 ring-primary ring-offset-2" : "")}
                >
                    <Monitor className="h-4 w-4 mr-2" />
                    AnyDesk
                </Button>
                <Button
                    type="button"
                    variant={activeTab === 'ifood' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTab('ifood')}
                    className={cn("flex-1", activeTab === 'ifood' ? "ring-2 ring-primary ring-offset-2" : "")}
                >
                    <Utensils className="h-4 w-4 mr-2" />
                    iFood
                </Button>
                <Button
                    type="button"
                    variant={activeTab === 'anota_ai' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTab('anota_ai')}
                    className={cn("flex-1", activeTab === 'anota_ai' ? "ring-2 ring-primary ring-offset-2" : "")}
                >
                    <Receipt className="h-4 w-4 mr-2" />
                    Anota Aí
                </Button>
            </div>

            {/* Content Area */}
            {activeTab && (
                <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold capitalize">
                            {activeTab === 'anota_ai' ? 'Anota Aí' : activeTab}
                        </span>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAdd(activeTab)}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {activeIntegrations.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2 italic">
                                Nenhum registro adicionado. Clique em "Adicionar" acima.
                            </p>
                        ) : (
                            activeIntegrations.map((item) => (
                                <div key={item.id} className="relative group border border-border rounded-md p-3 bg-card flex gap-2 items-start">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {activeTab === 'anydesk' && (
                                            <>
                                                <Input
                                                    placeholder="ID / Endereço"
                                                    value={(item as AnydeskIntegration).access}
                                                    onChange={(e) => handleUpdate(item.id, 'access', e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                                <Input
                                                    placeholder="Senha"
                                                    type="text" // Shown as text for ease of copy/access as per support tool context
                                                    value={(item as AnydeskIntegration).password || ''}
                                                    onChange={(e) => handleUpdate(item.id, 'password', e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </>
                                        )}
                                        {activeTab === 'ifood' && (
                                            <>
                                                <Input
                                                    placeholder="Email / Usuário"
                                                    value={(item as IfoodIntegration).username}
                                                    onChange={(e) => handleUpdate(item.id, 'username', e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                                <Input
                                                    placeholder="Senha"
                                                    type="text"
                                                    value={(item as IfoodIntegration).password || ''}
                                                    onChange={(e) => handleUpdate(item.id, 'password', e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </>
                                        )}
                                        {activeTab === 'anota_ai' && (
                                            <>
                                                <Input
                                                    placeholder="Email de Acesso"
                                                    value={(item as AnotaAiIntegration).email}
                                                    onChange={(e) => handleUpdate(item.id, 'email', e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                                <Input
                                                    placeholder="Senha"
                                                    type="text"
                                                    value={(item as AnotaAiIntegration).password || ''}
                                                    onChange={(e) => handleUpdate(item.id, 'password', e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemove(item.id)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                        title="Remover este registro"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
