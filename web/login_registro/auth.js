import { createClient } from '@supabase/supabase-js';

// modificar esto para usar las variables del archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dvtkkaxjehfotylwwsea.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A';

const supabase = createClient(supabaseUrl, supabaseKey);
// Conexion a la base de datos de Supabase y autenticación de usuarios
/**
 * Inicia sesión con un usuario existente
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise} - Promesa con el resultado del inicio de sesión
 */
export async function iniciarSesion(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Guarda información del usuario en localStorage o donde prefieras
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    throw error;
  }
}

/**
 * Registra un nuevo usuario
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @param {object} userData - Datos adicionales del usuario (opcional)
 * @returns {Promise} - Promesa con el resultado del registro
 */
export async function registrarUsuario(email, password, userData = {}) {
  try {
    // Registrar usuario en Authentication
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Datos adicionales como nombre, teléfono, etc.
      }
    });
    
    if (authError) throw authError;
    
    // Si quieres también guardar los datos en la tabla 'usuario'
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('usuario')
        .insert([
          {
            id_usuario: authData.user.id,
            email: email,
            fecha_registro: new Date(),
            verificado: false,
            ...userData
          }
        ]);
      
      if (profileError) {
        console.error('Error al guardar perfil:', profileError.message);
        // No lanzamos error aquí para no interrumpir el flujo si el auth funcionó
      }
    }
    
    return authData;
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    throw error;
  }
}

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise} - Promesa con el resultado del cierre de sesión
 */
export async function cerrarSesion() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Limpiar datos locales
    localStorage.removeItem('user');
    
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
    throw error;
  }
}

/**
 * Recupera el usuario actual si existe una sesión
 * @returns {Object|null} - Usuario actual o null si no hay sesión
 */
export async function obtenerUsuarioActual() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return data.user;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error.message);
    return null;
  }
}