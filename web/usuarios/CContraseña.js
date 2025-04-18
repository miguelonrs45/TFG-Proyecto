// resetPassword.js - Script para manejar el cambio de contraseña en CoWorkGo
// Este archivo debe ser incluido en tu página CContraseña.html

// Importación de la librería de Supabase
// Asegúrate de haber incluido el script de Supabase en tu HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Inicializar el cliente de Supabase
const supabaseUrl = 'https://dvtkkaxjehfotylwwsea.supabase.co'; // Reemplaza con tu URL de Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A'; // Reemplaza con tu clave pública de Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Función que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Capturar el formulario
    const resetForm = document.getElementById('resetPasswordForm');
    
    // Capturar elementos UI para mostrar mensajes
    const messageContainer = document.getElementById('messageContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Extraer el token de la URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    // Verificar si existe el token
    if (!token) {
        showMessage('Error: No se ha encontrado un token válido en la URL. Por favor, solicita un nuevo enlace de recuperación.', 'error');
        disableForm();
        return;
    }
    
    // Escuchar el evento submit del formulario
    resetForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Obtener los valores de los campos
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Validar complejidad de la contraseña
        if (!isValidPassword(password)) {
            showMessage('La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una minúscula y un número', 'error');
            return;
        }
        
        // Mostrar indicador de carga
        toggleLoading(true);
        
        try {
            // Actualizar la contraseña usando Supabase
            const { error } = await supabase.auth.updateUser(
                { password: password },
                { token: token }
            );
            
            if (error) {
                throw error;
            }
            
            // Éxito
            showMessage('¡Contraseña actualizada con éxito! Serás redirigido al inicio de sesión en unos segundos.', 'success');
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                window.location.href = '/login'; // Ajusta esta URL a tu página de login
            }, 3000);
            
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            
            // Mostrar mensaje de error específico si está disponible
            if (error.message) {
                showMessage(`Error: ${error.message}`, 'error');
            } else {
                showMessage('Ha ocurrido un error al cambiar la contraseña. Por favor, intenta nuevamente.', 'error');
            }
            
            toggleLoading(false);
        }
    });
    
    // Función para validar la complejidad de la contraseña
    function isValidPassword(password) {
        // Al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }
    
    // Función para mostrar mensajes
    function showMessage(message, type) {
        if (!messageContainer) return;
        
        messageContainer.textContent = message;
        messageContainer.className = ''; // Limpiar clases previas
        messageContainer.classList.add('message', type);
        messageContainer.style.display = 'block';
    }
    
    // Función para activar/desactivar el indicador de carga
    function toggleLoading(isLoading) {
        if (loadingSpinner) {
            loadingSpinner.style.display = isLoading ? 'block' : 'none';
        }
        
        // Deshabilitar/habilitar botón de envío
        const submitButton = resetForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.textContent = isLoading ? 'Cambiando contraseña...' : 'Cambiar contraseña';
        }
    }
    
    // Función para deshabilitar el formulario
    function disableForm() {
        const inputs = resetForm.querySelectorAll('input');
        const button = resetForm.querySelector('button');
        
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        if (button) {
            button.disabled = true;
        }
    }
});