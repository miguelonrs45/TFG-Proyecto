import { supabase } from '../conexion/services/supabase-service.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Verificar si hay una sesión activa
  const sesionActiva = await verificarSesionActiva();
  
  // Capturar elementos DOM
  const changePasswordForm = document.getElementById('change-password-form');
  const backButton = document.getElementById('back-button');
  const userEmailInput = document.getElementById('user-email');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  
  // Configurar botón de regreso
  backButton.addEventListener('click', () => {
    window.location.href = '/web/login_registro/iniciosesion.html';
  });
  
  // Extraer y procesar el hash de la URL para verificar si hay token de recuperación
  const hash = window.location.hash;
  let tokenValido = false;
  let accessToken, refreshToken;
  
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get('access_token');
    refreshToken = params.get('refresh_token');
    const type = params.get('type');
    
    if (type === 'recovery' && accessToken) {
      try {
        // Establecer la sesión con el token de recuperación
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        if (!error && data.session) {
          tokenValido = true;
          
          // Pre-llenar email si está disponible
          if (data.user && data.user.email) {
            userEmailInput.value = data.user.email;
            userEmailInput.disabled = true; // No permitir cambiar el email en este caso
          }
        }
      } catch (error) {
        console.error('Error al establecer sesión:', error);
      }
    }
  }
  
  // Si hay un error en el enlace de recuperación
  if (hash && hash.includes('error=')) {
    // Mostrar error al usuario
    mostrarAlerta('El enlace de recuperación ha expirado o es inválido. Por favor, solicita un nuevo enlace.', 'danger');
  }
  
  // Escuchar el evento submit del formulario
  changePasswordForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Obtener los valores de los campos
    const email = userEmailInput.value;
    const password = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validaciones básicas
    if (!email || !password || !confirmPassword) {
      mostrarAlerta('Por favor, completa todos los campos', 'danger');
      return;
    }
    
    if (!isValidEmail(email)) {
      mostrarAlerta('Por favor, ingresa un correo electrónico válido', 'danger');
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      mostrarAlerta('Las contraseñas no coinciden', 'danger');
      return;
    }
    
    // Validar complejidad de la contraseña
    if (!isValidPassword(password)) {
      mostrarAlerta('La contraseña debe cumplir todos los requisitos de seguridad', 'danger');
      return;
    }
    
    // Mostrar indicador de carga
    const loading = document.createElement('ion-loading');
    loading.message = 'Procesando...';
    document.body.appendChild(loading);
    await loading.present();
    
    try {
      if (tokenValido) {
        // Caso 1: Tenemos un token válido para cambiar la contraseña directamente
        const { error } = await supabase.auth.updateUser({ 
          password: password 
        });
        
        if (error) throw error;
        
        // Mostrar mensaje de éxito
        mostrarAlerta('Contraseña actualizada con éxito', 'success');
        
        // Redirigir al login tras unos segundos
        setTimeout(() => {
          window.location.href = '/web/login_registro/iniciosesion.html';
        }, 2000);
      } else if (sesionActiva) {
        // Caso 2: El usuario está autenticado y quiere cambiar su contraseña
        
        // Primero, verificar la identidad con una re-autenticación
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData && userData.user && userData.user.email === email) {
          // Solicitar contraseña actual para verificar identidad
          const currentPassword = await solicitarContraseñaActual();
          
          if (!currentPassword) {
            throw new Error('Se requiere la contraseña actual para continuar');
          }
          
          // Intentar autenticar con las credenciales actuales
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: currentPassword
          });
          
          if (authError) throw new Error('La contraseña actual es incorrecta');
          
          // Si la autenticación es exitosa, proceder a cambiar la contraseña
          const { error } = await supabase.auth.updateUser({ 
            password: password 
          });
          
          if (error) throw error;
          
          // Mostrar mensaje de éxito
          mostrarAlerta('Contraseña actualizada con éxito', 'success');
          
          // Redirigir al perfil tras unos segundos
          setTimeout(() => {
            window.location.href = '/web/menus/perfil.html';
          }, 2000);
        } else {
          throw new Error('El correo electrónico no coincide con el usuario actual');
        }
      } else {
        // Caso 3: No hay token ni sesión, enviar correo de restablecimiento
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/web/usuarios/CContraseña.html',
        });
        
        if (error) throw error;
        
        // Mostrar mensaje informativo
        mostrarAlerta('Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.', 'success', 5000);
        
        // Redirigir al login tras unos segundos
        setTimeout(() => {
          window.location.href = '/web/login_registro/iniciosesion.html';
        }, 5000);
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      mostrarAlerta(`Error: ${error.message || 'No se pudo procesar la solicitud'}`, 'danger');
    } finally {
      // Cerrar indicador de carga
      await loading.dismiss();
    }
  });
});

// Función para solicitar la contraseña actual mediante un diálogo
async function solicitarContraseñaActual() {
  return new Promise((resolve) => {
    const alert = document.createElement('ion-alert');
    alert.header = 'Verificación de identidad';
    alert.message = 'Por favor, ingresa tu contraseña actual para confirmar tu identidad:';
    alert.inputs = [
      {
        name: 'password',
        type: 'password',
        placeholder: 'Contraseña actual'
      }
    ];
    alert.buttons = [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          resolve(null);
        }
      },
      {
        text: 'Verificar',
        handler: (data) => {
          resolve(data.password);
        }
      }
    ];

    document.body.appendChild(alert);
    alert.present();
  });
}

// Verificar si hay una sesión activa
async function verificarSesionActiva() {
  try {
    const { data } = await supabase.auth.getSession();
    return !!(data && data.session);
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return false;
  }
}

// Validación de correo electrónico
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validación de contraseña
function isValidPassword(password) {
  // Verificar requisitos mínimos
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  
  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
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