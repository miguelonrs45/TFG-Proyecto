import { supabase } from '../conexion/services/supabase-service.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  // Verificar si ya hay una sesión activa
  verificarSesionActiva();

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

      // Validar formato de correo electrónico
      if (!isValidEmail(email)) {
        throw new Error('Por favor, ingresa un correo electrónico válido');
      }

      // Validar complejidad de la contraseña
      if (!isValidPassword(password)) {
        throw new Error('La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial');
      }

      // Mostrar indicador de carga
      const loading = document.createElement('ion-loading');
      loading.message = 'Creando cuenta...';
      document.body.appendChild(loading);
      await loading.present();

      // Registrar usuario con Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            nombre,
            fecha_registro: new Date().toISOString()
          }
        }
      });

      // Cerrar indicador de carga
      await loading.dismiss();
      
      if (error) throw error;
      
      if (data && data.user) {
        // Guardar también en la tabla 'usuario' para datos adicionales
        const { error: profileError } = await supabase
          .from('usuario')
          .insert([
            {
              id_usuario: data.user.id,
              nombre: nombre,
              email: email,
              fecha_registro: new Date().toISOString(),
              verificado: false
            }
          ]);
        
        if (profileError) {
          console.error('Error al guardar perfil:', profileError.message);
          // Continuar a pesar del error, ya que el usuario ha sido creado
        }

        // Mostrar mensaje según si requiere confirmación o no
        if (data.session) {
          // Si hay sesión, no se requiere confirmación por correo
          mostrarAlerta('¡Registro exitoso! Serás redirigido en unos momentos.', 'success');
          
          // Guardar datos mínimos de sesión
          sessionStorage.setItem('userId', data.user.id);
          sessionStorage.setItem('userEmail', data.user.email);
          sessionStorage.setItem('userName', nombre);
          sessionStorage.setItem('isAuthenticated', 'true');
          
          // Redireccionar a la página de inicio
          setTimeout(() => {
            window.location.href = '/web/pantalla_Inicio/inicio.html';
          }, 2000);
        } else {
          // Si no hay sesión, se requiere confirmación por correo
          mostrarAlerta('¡Registro exitoso! Por favor, verifica tu correo electrónico para activar tu cuenta.', 'success', 5000);
          
          // Redireccionar a la página de inicio de sesión
          setTimeout(() => {
            window.location.href = 'iniciosesion.html';
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Manejo específico de errores
      if (error.message.includes('already registered')) {
        mostrarAlerta('Este correo electrónico ya está registrado. Intenta iniciar sesión.', 'warning');
      } else {
        mostrarAlerta(`Error: ${error.message || 'Error en el registro. Por favor, inténtalo de nuevo.'}`, 'danger');
      }
    }
  });
});

// Verificar si hay una sesión activa
async function verificarSesionActiva() {
  try {
    const { data } = await supabase.auth.getSession();
    
    if (data && data.session) {
      // Si hay una sesión activa, redirigir al inicio
      window.location.href = '/web/pantalla_Inicio/inicio.html';
    }
  } catch (error) {
    console.error('Error al verificar sesión:', error);
  }
}

// Validación de correo electrónico
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validación de contraseña
function isValidPassword(password) {
  // Al menos 6 caracteres, una mayúscula, una minúscula, un número y un carácter especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return regex.test(password);
}

// Función para mostrar alertas
async function mostrarAlerta(mensaje, color = 'primary', duracion = 3000) {
  const toast = document.createElement('ion-toast');
  toast.message = mensaje;
  toast.duration = duracion;
  toast.position = 'top';
  toast.color = color;
  document.body.appendChild(toast);
  await toast.present();
}