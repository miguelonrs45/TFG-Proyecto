import { supabase } from '../conexion/services/supabase-service.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Elementos DOM
  const requestResetContainer = document.getElementById('requestResetContainer');
  const resetPasswordContainer = document.getElementById('resetPasswordContainer');
  const requestResetForm = document.getElementById('requestResetForm');
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  
  // Verificar si ya hay una sesión activa
  const sesionActiva = await verificarSesionActiva();
  if (sesionActiva) {
    // Si hay sesión activa, redirigir al inicio
    window.location.href = '/web/pantalla_Inicio/inicio.html';
    return;
  }
  
  // Obtener el hash de la URL para ver si hay un token
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.substring(1)); // Eliminar el # inicial
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');
  
  // Verificar si hay una sesión activa por token de recuperación
  let hasValidSession = false;
  
  if (type === 'recovery' && accessToken) {
    try {
      // Establecer la sesión con el token de recuperación
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      });
      
      if (!error && data.session) {
        hasValidSession = true;
        
        // Registrar evento analítico (opcional)
        console.log('Usuario accedió a restablecimiento de contraseña con token válido');
      }
    } catch (error) {
      console.error('Error al establecer sesión:', error);
    }
  }
  
  // Mostrar el contenedor apropiado
  if (hasValidSession) {
    // Mostrar el formulario para establecer nueva contraseña
    requestResetContainer.style.display = 'none';
    resetPasswordContainer.style.display = 'block';
    
    // Manejar el formulario de restablecimiento de contraseña
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const password = resetPasswordForm.querySelectorAll('ion-input[type="password"]')[0].value;
      const confirmPassword = resetPasswordForm.querySelectorAll('ion-input[type="password"]')[1].value;
      
      // Validación básica
      if (!password || !confirmPassword) {
        mostrarAlerta('Por favor, completa todos los campos', 'danger');
        return;
      }
      
      if (password !== confirmPassword) {
        mostrarAlerta('Las contraseñas no coinciden', 'danger');
        return;
      }
      
      // Validar complejidad de la contraseña
      if (!isValidPassword(password)) {
        mostrarAlerta('La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial', 'danger');
        return;
      }
      
      // Mostrar indicador de carga
      const loading = document.createElement('ion-loading');
      loading.message = 'Actualizando contraseña...';
      document.body.appendChild(loading);
      await loading.present();
      
      try {
        // Actualizar la contraseña
        const { error } = await supabase.auth.updateUser({ 
          password: password 
        });
        
        // Cerrar indicador de carga
        await loading.dismiss();
        
        if (error) throw error;
        
        // Mostrar mensaje de éxito
        const alert = document.createElement('ion-alert');
        alert.header = 'Contraseña actualizada';
        alert.message = 'Tu contraseña ha sido actualizada correctamente. Serás redirigido a la página de inicio de sesión.';
        alert.buttons = [{
          text: 'Continuar',
          handler: () => {
            // Cerrar sesión y redirigir a la página de inicio de sesión
            supabase.auth.signOut().then(() => {
              window.location.href = 'iniciosesion.html';
            });
          }
        }];
        
        document.body.appendChild(alert);
        await alert.present();
        
      } catch (error) {
        // Cerrar indicador de carga
        await loading.dismiss();
        
        console.error('Error al cambiar contraseña:', error);
        mostrarAlerta(`Error: ${error.message || 'No se pudo actualizar la contraseña'}`, 'danger');
      }
    });
  } else {
    // Mostrar el formulario para solicitar restablecimiento
    requestResetContainer.style.display = 'block';
    resetPasswordContainer.style.display = 'none';
    
    // Manejar el formulario de solicitud de restablecimiento
    requestResetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = requestResetForm.querySelector('ion-input[type="email"]').value;
      
      if (!email || !isValidEmail(email)) {
        mostrarAlerta('Por favor, ingresa un correo electrónico válido', 'danger');
        return;
      }
      
      // Mostrar indicador de carga
      const loading = document.createElement('ion-loading');
      loading.message = 'Enviando correo...';
      document.body.appendChild(loading);
      await loading.present();
      
      try {
        // Configuración de redirección para que vuelva a la página correcta
        const redirectUrl = `${window.location.origin}/web/login_registro/reset-password.html`;
        
        // Enviar correo de restablecimiento
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl
        });
        
        // Cerrar indicador de carga
        await loading.dismiss();
        
        if (error) throw error;
        
        // Mostrar mensaje de éxito con información adicional
        const alert = document.createElement('ion-alert');
        alert.header = 'Correo enviado';
        alert.message = `
          Se ha enviado un enlace de recuperación a ${email}. 
          <br><br>
          Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para completar el proceso.
          <br><br>
          El enlace expirará en 1 hora.
        `;
        alert.buttons = [{
          text: 'Entendido',
          handler: () => {
            // Redirigir a la página de inicio de sesión después de unos segundos
            window.location.href = 'iniciosesion.html';
          }
        }];
        
        document.body.appendChild(alert);
        await alert.present();
        
      } catch (error) {
        // Cerrar indicador de carga
        await loading.dismiss();
        
        console.error('Error al enviar correo:', error);
        
        // Procesamiento especial para ciertos errores
        if (error.message.includes('rate limit')) {
          mostrarAlerta('Has realizado demasiadas solicitudes. Por favor, intenta nuevamente más tarde.', 'danger');
        } else if (error.message.includes('not found')) {
          // Por seguridad, no revelar si el correo existe o no
          mostrarAlerta('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.', 'primary');
          
          // Redirigir a la página de inicio de sesión después de unos segundos
          setTimeout(() => {
            window.location.href = 'iniciosesion.html';
          }, 3000);
        } else {
          mostrarAlerta(`Error: ${error.message || 'No se pudo enviar el correo de restablecimiento'}`, 'danger');
        }
      }
    });
  }
});

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