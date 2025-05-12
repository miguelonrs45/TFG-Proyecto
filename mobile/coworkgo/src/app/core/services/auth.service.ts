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
  private sessionInitialized = false; // Bandera para seguir estado de inicialización

  constructor(private router: Router) {
    // Estos valores deberían estar en un entorno de variables
    const supabaseUrl = 'https://dvtkkaxjehfotylwwsea.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A';

    // Configurar Supabase para persistir sesión explícitamente
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storage: localStorage
      }
    });

    // Verificar si hay una sesión al iniciar
    this.loadUser();

    // Agregar listener para cambios de sesión
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      if (session) {
        this.currentUserSubject.next(session.user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  get currentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  async loadUser() {
    try {
      console.log('Cargando sesión de usuario...');
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        console.error('Error al cargar la sesión:', error);
        this.sessionInitialized = true;
        return;
      }

      if (data && data.session) {
        console.log('Sesión recuperada correctamente:', data.session.user.email);
        this.currentUserSubject.next(data.session.user);

        // También sincronizar el usuario al cargar la sesión
        await this.sincronizarUsuario(data.session.user);
      } else {
        console.log('No hay sesión activa');
      }

      this.sessionInitialized = true;
    } catch (error) {
      console.error('Error inesperado al cargar usuario:', error);
      this.sessionInitialized = true;
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data && data.user) {
        this.currentUserSubject.next(data.user);

        // Sincronizar el usuario con la tabla Usuario
        await this.sincronizarUsuario(data.user);

        return data.user;
      }

      // Si no hay error pero tampoco hay usuario, devolvemos null
      return null;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // Nuevo método para inicio de sesión con Google
  async signInWithGoogle(): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  // Método para manejar la autenticación después de la redirección
  async handleAuthRedirect(): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) throw error;

      if (data && data.session) {
        this.currentUserSubject.next(data.session.user);

        // Sincronizar el usuario - usa nuestro método unificado
        await this.sincronizarUsuario(data.session.user);

        return data.session.user;
      }

      return null;
    } catch (error) {
      console.error('Error al manejar la redirección de auth:', error);
      throw error;
    }
  }

  async signUp(nombre: string, apellidos: string, email: string, password: string, telefono: string): Promise<any> {
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

      // Si no hay error pero tampoco hay usuario, devolvemos null
      return null;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:4200/reset-password',
      });

      if (error) throw error;

      return { success: true, message: 'Se ha enviado un correo de recuperación a tu dirección de email' };
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true, message: 'Tu contraseña ha sido actualizada exitosamente' };
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  // Método para verificar si la sesión se ha inicializado
  async isSessionLoaded(): Promise<boolean> {
    // Si la sesión ya se inicializó, devolver una promesa resuelta
    if (this.sessionInitialized) {
      return Promise.resolve(this.isAuthenticated);
    }

    // De lo contrario, esperar hasta que se inicialice
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.sessionInitialized) {
          clearInterval(interval);
          resolve(this.isAuthenticated);
        }
      }, 100);
    });
  }

  // Función para sincronizar usuario - versión mejorada y unificada
  private async sincronizarUsuario(user: any) {
    try {
      // Verificar si el usuario ya existe en la tabla Usuario
      const { data: existingUser, error: queryError } = await this.supabase
        .from('Usuario')
        .select('*')
        .eq('id_usuario', user.id)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        // PGRST116 significa que no se encontró el registro, lo cual es esperado
        console.error('Error al verificar usuario existente:', queryError);
        return;
      }

      if (!existingUser) {
        console.log('Usuario no encontrado en tabla Usuario, creando nuevo registro...');

        // Extraer datos del perfil
        const nombre = user.user_metadata?.nombre || user.user_metadata?.["full_name"]?.split(' ')?.[0] || '';
        const apellidos = user.user_metadata?.apellidos || user.user_metadata?.["full_name"]?.split(' ').slice(1).join(' ') || '';

        // Si no existe, insertarlo
        const { error: insertError } = await this.supabase
          .from('Usuario')
          .insert({
            id_usuario: user.id,
            nombre: nombre,
            apellidos: apellidos,
            email: user.email,
            telefono: user.user_metadata?.telefono || '',
            verificado: user.email_confirmed_at ? true : false,
            fecha_registo: new Date()
          });

        if (insertError) {
          console.error('Error al insertar usuario:', insertError);
        } else {
          console.log('Usuario insertado correctamente en tabla Usuario');
        }
      } else {
        console.log('Usuario ya existe en tabla Usuario');
      }
    } catch (error) {
      console.error('Error al sincronizar usuario:', error);
    }
  }
}
