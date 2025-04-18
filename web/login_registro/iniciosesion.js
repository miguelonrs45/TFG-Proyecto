// Importación de Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuración de Supabase
const supabaseUrl = 'https://dvtkkaxjehfotylwwsea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para iniciar sesión
async function iniciarSesion(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Guardar información del usuario en localStorage
    localStorage.setItem('usuario', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    throw error;
  }
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  
  // Agregar evento al formulario de inicio de sesión
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener valores del formulario
    const email = loginForm.querySelector('ion-input[type="email"]').value;
    const password = loginForm.querySelector('ion-input[type="password"]').value;
    
    // Validación básica
    if (!email || !password) {
      mostrarAlerta('Por favor, completa todos los campos', 'danger');
      return;
    }
    
    // Mostrar indicador de carga
    const loading = document.createElement('ion-loading');
    loading.message = 'Iniciando sesión...';
    document.body.appendChild(loading);
    await loading.present();
    
    try {
      // Intentar iniciar sesión
      const { user } = await iniciarSesion(email, password);
      
      // Cerrar indicador de carga
      await loading.dismiss();
      
      if (user) {
        // Mostrar mensaje de éxito
        mostrarAlerta('¡Bienvenido de nuevo!', 'success');
        
          // Redireccionar al usuario a la página principal con la ruta correcta
        setTimeout(() => {
          // Usar ruta relativa para acceder al archivo inicio.html en la carpeta pantalla_Inicio
          window.location.href = '/web/pantalla_Inicio/inicio.html';
        }, 1500);
      }
    } catch (error) {
      // Cerrar indicador de carga
      await loading.dismiss();
      
      // Verificar el tipo de error
      if (error.message.includes('Invalid login') || error.message.includes('Email not confirmed') || 
          error.message.includes('Invalid email') || error.message.includes('user not found')) {
        mostrarAlertaConOpciones(
          'Usuario no encontrado o credenciales incorrectas',
          'Intentar de nuevo',
          'Registrarse',
          () => {
            // Limpiar el campo de contraseña
            loginForm.querySelector('ion-input[type="password"]').value = '';
          },
          () => {
            window.location.href = 'registro.html';
          }
        );
      } else {
        // Mostrar mensaje de error genérico
        mostrarAlerta(`Error: ${error.message || 'Error al iniciar sesión'}`, 'danger');
      }
    }
  });
  
  // Redirigir al archivo de restablecimiento de contraseña
  const forgotPasswordButton = document.querySelector('.forgot-password ion-button');
  if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener('click', () => {
      // Redirigir directamente a la página de restablecimiento de contraseña
      window.location.href = 'reset-password.html';
    });
  }
});

// Función para mostrar alertas simples
function mostrarAlerta(mensaje, color = 'primary', duracion = 3000) {
  const toast = document.createElement('ion-toast');
  toast.message = mensaje;
  toast.duration = duracion;
  toast.position = 'top';
  toast.color = color;
  document.body.appendChild(toast);
  toast.present();
}

// Función para mostrar alerta con opciones (intentar de nuevo o registrarse)
async function mostrarAlertaConOpciones(mensaje, opcion1Texto, opcion2Texto, opcion1Callback, opcion2Callback) {
  const alert = document.createElement('ion-alert');
  alert.header = 'Error de inicio de sesión';
  alert.message = mensaje;
  alert.buttons = [
    {
      text: opcion1Texto,
      role: 'cancel',
      handler: opcion1Callback
    },
    {
      text: opcion2Texto,
      handler: opcion2Callback
    }
  ];
  document.body.appendChild(alert);
  await alert.present();
}