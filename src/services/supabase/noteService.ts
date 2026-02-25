import { supabase } from '../../lib/supabase';
import type { Note } from '../types';

export const noteService = {
    async getNotes() {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('is_favorite', { ascending: false }) // Favorites first
            .order('updated_at', { ascending: false }); // Then recent

        if (error) throw error;
        return data as Note[];
    },

    async createNote(noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('notes')
            .insert([noteData])
            .select()
            .single();

        if (error) throw error;
        return data as Note;
    },

    async updateNote(id: string, updates: Partial<Note>) {
        const { data, error } = await supabase
            .from('notes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Note;
    },

    async deleteNote(id: string) {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
