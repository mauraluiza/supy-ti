export interface Client {
    id: string;
    user_id: string;
    name: string;
    system: 'winfood' | 'cplug';
    status: 'implantation' | 'active' | 'inactive';
    login_code?: string;
    system_login?: string;
    encrypted_password?: string;
    cnpj?: string;
    contact_info: ContactInfo[];
    integrations: Integration[];
    created_at: string;
}

export interface ContactInfo {
    type: string;
    value: string;
    name?: string;
}

export type IntegrationType = 'anydesk' | 'ifood' | 'anota_ai';

export interface BaseIntegration {
    id: string; // Para controle de UI (remoção/edição)
    type: IntegrationType;
}

export interface AnydeskIntegration extends BaseIntegration {
    type: 'anydesk';
    access: string;
    password?: string;
}

export interface IfoodIntegration extends BaseIntegration {
    type: 'ifood';
    username: string;
    password?: string;
}

export interface AnotaAiIntegration extends BaseIntegration {
    type: 'anota_ai';
    email: string;
    password?: string;
}

export type Integration = AnydeskIntegration | IfoodIntegration | AnotaAiIntegration;


export interface Task {
    id: string;
    client_id: string;
    user_id: string;
    description: string;
    status: 'urgent' | 'in_progress' | 'pending' | 'done';
    created_at: string;
    updated_at: string;
    client?: Client; // Join
}

export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}
