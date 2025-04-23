import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(private router: Router) {
    // Estos valores deberían estar en un entorno de variables
    const supabaseUrl = 'https://dvtkkaxjehfotylwwsea.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A';

    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar si hay una sesión al iniciar
    this.loadUser();
  }

  get currentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  async loadUser() {
    const { data } = await this.supabase.auth.getSession();
    if (data && data.session) {
      this.currentUserSubject.next(data.session.user);
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data && data.user) {
        this.currentUserSubject.next(data.user);
        return data.user;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  async signUp(nombre: string, apellidos: string, email: string, password: string, telefono: string) {
    try {
      // Registrar al usuario en Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data && data.user) {
        // Guardar información adicional en la tabla de usuarios
        const { error: profileError } = await this.supabase
          .from('Usuario')
          .insert([
            {
              id_usuario: data.user.id,
              nombre,
              apellidos,
              email,
              telefono,
              verificado: false,
              fecha_registo: new Date()
            }
          ]);

        if (profileError) throw profileError;

        this.currentUserSubject.next(data.user);
        return data.user;
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }
}
