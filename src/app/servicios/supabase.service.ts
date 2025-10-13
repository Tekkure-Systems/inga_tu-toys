import {Injectable} from '@angular/core';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;
    constructor() {
        this.supabase = createClient(
            'https://rvmkcjlnvhdonvczgnwk.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bWtjamxudmhkb252Y3pnbndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDA0NzIsImV4cCI6MjA3NTcxNjQ3Mn0.-JZg4wGxaaSWnBHErmJkI-ympAEzu31-9I2Flvw5W1A' // Reemplaza con tu anon key de Supabase
        );
    }
    async getProductos() {
        const {data, error} = await this.supabase
            .from('productos')
            .select('*');
        if (error) throw error;
        return data;
    }
}