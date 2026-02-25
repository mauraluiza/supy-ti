import { supabase } from '../../lib/supabase';
import type { Task } from '../types';

export const taskService = {
    async getTasks() {
        // Includes client data via join
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                client:clients (
                    id,
                    name,
                    system
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Task[];
    },

    async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select()
            .single();

        if (error) throw error;
        return data as Task;
    },

    async updateTask(id: string, updates: Partial<Task>) {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Task;
    },

    async deleteTask(id: string) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
