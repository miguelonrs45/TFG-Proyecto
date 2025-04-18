// Importación de Supabase desde CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuración de Supabase
const supabaseUrl = 'https://dvtkkaxjehfotylwwsea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para registrar un usuario
async function registrarUsuario(email, password, userData = {}) {
  try {
    // Registrar usuario en Authentication
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Datos adicionales como nombre, teléfono, etc.
      }
    });
    
    if (error) throw error;
    
    // Si quieres también guardar los datos en la tabla 'usuario'
    if (data.user) {
      const { error: profileError } = await supabase
        .from('usuario')
        .insert([
          {
            id_usuario: data.user.id,
            nombre: userData.nombre,
            email: email,
            fecha_registro: new Date().toISOString(),
            verificado: false
          }
        ]);
      
      if (profileError) {
        console.error('Error al guardar perfil:', profileError.message);
        // No lanzamos error aquí para no interrumpir el flujo si el auth funcionó
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      // Obtener los valores del formulario
      const nombre = registerForm.querySelector('ion-input[type="text"]').value;
      const email = registerForm.querySelector('ion-input[type="email"]').value;
      const password = registerForm.querySelectorAll('ion-input[type="password"]')[0].value;
      const confirmPassword = registerForm.querySelectorAll('ion-input[type="password"]')[1].value;

      // Validación básica
      if (!nombre || !email || !password || !confirmPassword) {
        throw new Error('Por favor, completa todos los campos');
      }

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Registrar usuario con Supabase
      const { user } = await registrarUsuario(email, password, { nombre });
      
      if (user) {
        // Mostrar mensaje de éxito
        const toast = document.createElement('ion-toast');
        toast.message = '¡Registro exitoso! Por favor, verifica tu correo electrónico.';
        toast.duration = 3000;
        toast.position = 'top';
        toast.color = 'success';
        document.body.appendChild(toast);
        await toast.present();

        // Redireccionar después del registro exitoso
        setTimeout(() => {
          window.location.href = 'iniciosesion.html';
        }, 2000);
      }
    } catch (error) {
      // Mostrar mensaje de error
      console.error('Error:', error);
      
      const toast = document.createElement('ion-toast');
      toast.message = `Error: ${error.message || 'Error en el registro. Por favor, inténtalo de nuevo.'}`;
      toast.duration = 3000;
      toast.position = 'top';
      toast.color = 'danger';
      document.body.appendChild(toast);
      await toast.present();
    }
  });
});