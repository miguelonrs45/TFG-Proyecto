import { supabase } from '../conexion/services/supabase-service.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Capturar el formulario
    const changePasswordForm = document.getElementById('change-password-form');
    const backButton = document.getElementById('back-button');
    
    // Configurar botón de regreso
    backButton.addEventListener('click', () => {
        window.location.href = '/web/login_registro/iniciosesion.html';
    });
    
    // Extraer y procesar el hash de la URL para buscar errores
    const hash = window.location.hash;
    if (hash.includes('error=')) {
        // Mostrar error al usuario
        mostrarAlerta('El enlace de recuperación ha expirado o es inválido. Por favor, solicita un nuevo enlace.', 'danger');
        return;
    }
    
    // Escuchar el evento submit del formulario
    changePasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Obtener los valores de los campos
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
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
        loading.message = 'Enviando solicitud...';
        document.body.appendChild(loading);
        await loading.present();
        
        try {
            // Enviar correo para restablecer contraseña con el email proporcionado
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/web/usuarios/CContraseña.html',
            });
            
            if (error) throw error;
            
            // Cerrar indicador de carga
            await loading.dismiss();
            
            // Mostrar mensaje de éxito
            mostrarAlerta('Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.', 'success', 6000);
            
            // Redirigir al login tras unos segundos
            setTimeout(() => {
                window.location.href = '/web/login_registro/iniciosesion.html';
            }, 6000);
            
        } catch (error) {
            // Cerrar indicador de carga
            await loading.dismiss();
            
            console.error('Error al procesar la solicitud:', error);
            mostrarAlerta(`Error: ${error.message || 'No se pudo procesar la solicitud'}`, 'danger');
        }
    });
    
    // Función para validar la complejidad de la contraseña
    function isValidPassword(password) {
        // Validar longitud mínima
        if (password.length < 6) return false;
        
        // Validar al menos una mayúscula
        if (!/[A-Z]/.test(password)) return false;
        
        // Validar al menos una minúscula
        if (!/[a-z]/.test(password)) return false;
        
        // Validar al menos un número
        if (!/[0-9]/.test(password)) return false;
        
        // Validar al menos un carácter especial
        if (!/[^A-Za-z0-9]/.test(password)) return false;
        
        return true;
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