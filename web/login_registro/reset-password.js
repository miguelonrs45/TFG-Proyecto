import { supabase } from '../conexion/services/supabase-service.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Contenedores para los diferentes estados
  const requestResetContainer = document.getElementById('requestResetContainer');
  const resetPasswordContainer = document.getElementById('resetPasswordContainer');
  
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
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      });
      
      if (!error) {
        hasValidSession = true;
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
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
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
      
      try {
        // Actualizar la contraseña
        const { error } = await supabase.auth.updateUser({ password });
        
        if (error) throw error;
        
        mostrarAlerta('Contraseña actualizada con éxito', 'success');
        
        // Redirigir a la página de inicio de sesión
        setTimeout(() => {
          window.location.href = 'iniciosesion.html';
        }, 2000);
        
      } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        mostrarAlerta(`Error: ${error.message || 'No se pudo actualizar la contraseña'}`, 'danger');
      }
    });
  } else {
    // Mostrar el formulario para solicitar restablecimiento
    requestResetContainer.style.display = 'block';
    resetPasswordContainer.style.display = 'none';
    
    // Manejar el formulario de solicitud de restablecimiento
    const requestResetForm = document.getElementById('requestResetForm');
    
    requestResetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = requestResetForm.querySelector('ion-input[type="email"]').value;
      
      if (!email) {
        mostrarAlerta('Por favor, ingresa tu correo electrónico', 'danger');
        return;
      }
      
      try {
        // Mostrar indicador de carga
        const loading = document.createElement('ion-loading');
        loading.message = 'Enviando correo...';
        document.body.appendChild(loading);
        await loading.present();
        
        // Enviar correo de restablecimiento
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/web/usuarios/CContraseña.html'
        });
        
        // Cerrar indicador de carga
        await loading.dismiss();
        
        if (error) throw error;
        
        mostrarAlerta('Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.', 'success', 6000);
        
        // Redirigir a la página de inicio de sesión después de unos segundos
        setTimeout(() => {
          window.location.href = 'iniciosesion.html';
        }, 6000);
        
      } catch (error) {
        console.error('Error al enviar correo:', error);
        mostrarAlerta(`Error: ${error.message || 'No se pudo enviar el correo de restablecimiento'}`, 'danger');
      }
    });
  }
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, color = 'primary', duracion = 3000) {
  const toast = document.createElement('ion-toast');
  toast.message = mensaje;
  toast.duration = duracion;
  toast.position = 'top';
  toast.color = color;
  document.body.appendChild(toast);
  toast.present();
}