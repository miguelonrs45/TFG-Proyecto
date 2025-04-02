// src/app/services/supabase-service.js
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase-config';

// Usa la configuración importada
export const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseKey
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