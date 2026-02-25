import { supabase } from '../../lib/supabase';
import type { Client } from '../types';

export const clientService = {
    async getClients() {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Client[];
    },

    async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'user_id'> & { user_id: string }) {
        const { data, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

        if (error) throw error;
        return data as Client;
    },

    async updateClient(id: string, updates: Partial<Client>) {
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Client;
    },

    async deleteClient(id: string) {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
