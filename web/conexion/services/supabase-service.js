// src/app/services/supabase-service.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { supabaseConfig } from '../config/supabase-config.js';

// Crear cliente Supabase usando la configuración
export const supabase = createClient(
  supabaseConfig.supabaseUrl || 'https://dvtkkaxjehfotylwwsea.supabase.co',
  supabaseConfig.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A'
);

// Obtener datos
export const obtenerDatos = async (tabla) => {
  const { data, error } = await supabase.from(tabla).select('*');
  if (error) throw error;
  return data;
};

// Obtener un registro específico
export const obtenerRegistro = async (tabla, id) => {
  const { data, error } = await supabase.from(tabla).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

// Insertar datos
export const insertarDato = async (tabla, datos) => {
  const { data, error } = await supabase.from(tabla).insert([datos]);
  if (error) throw error;
  return data;
};

// Actualizar datos
export const actualizarDato = async (tabla, id, datos) => {
  const { data, error } = await supabase.from(tabla).update(datos).eq('id', id);
  if (error) throw error;
  return data;
};

// Eliminar datos
export const eliminarDato = async (tabla, id) => {
  const { data, error } = await supabase.from(tabla).delete().eq('id', id);
  if (error) throw error;
  return data;
};

// Funciones de autenticación
export const registrarUsuario = async (email, password) => {
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return user;
};

export const iniciarSesion = async (email, password) => {
  const { user, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return user;
};

export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// // Función para restablecer contraseña
// export const resetPasswordForEmail = async (email, redirectUrl) => {
//   const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
//     redirectTo: redirectUrl
//   });
//   if (error) throw error;
//   return data;
// };