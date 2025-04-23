export const supabaseConfig = {
  // Definir valores directamente en lugar de usar variables de entorno
  supabaseUrl: 'https://dvtkkaxjehfotylwwsea.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A'
};

// export const supabaseConfig = {
//   // Usar variables de entorno o fallback a valores por defecto (solo para desarrollo) Modificarlo para producción
//   supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://dvtkkaxjehfotylwwsea.supabase.co',
//   supabaseKey: import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A',
// };