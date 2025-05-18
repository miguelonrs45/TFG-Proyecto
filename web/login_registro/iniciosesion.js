
/**
 * Iniciar sesión - Versión unificada con soporte para Google
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando página de login...");
    
    // Referencias a elementos
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordBtn = document.querySelector('.forgot-password ion-button');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    
    // Verificar si venimos de logout
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogout = urlParams.get('fromLogout');
    
    if (fromLogout === 'true') {
        console.log("Redirigido desde logout - limpiando almacenamiento");
        sessionStorage.clear();
        localStorage.removeItem('supabase.auth.token');
        
        // Eliminar tokens de Supabase
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
                localStorage.removeItem(key);
            }
        });
        
        // Mostrar mensaje
        setTimeout(() => {
            mostrarAlerta("Has cerrado sesión correctamente", "success");
        }, 300);
    }
    
    // Asegurarse de que el servicio Supabase esté disponible
    if (typeof window.supabaseService === 'undefined') {
        console.log("Cargando servicio de Supabase...");
        const script = document.createElement('script');
        script.src = '/web/conexion/services/supabase-service.js';
        document.head.appendChild(script);
        
        // Esperar a que esté disponible
        const checkService = setInterval(() => {
            if (typeof window.supabaseService !== 'undefined') {
                clearInterval(checkService);
                console.log("Servicio de Supabase cargado con éxito");
                verificarSesion();
            }
        }, 100);
    } else {
        verificarSesion();
    }
    
    // Función para verificar sesión activa
    async function verificarSesion() {
        // Comprobar si hay un parámetro force=true en la URL
        if (urlParams.get('force') === 'true') {
            console.log("Parámetro force=true detectado - Ignorando sesión activa");
            return false;
        }
        
        try {
            // Verificar si hay sesión activa usando el servicio
            if (window.supabaseService) {
                const sesionActiva = await window.supabaseService.verificarSesion();
                
                if (sesionActiva) {
                    console.log("Sesión activa detectada - Redirigiendo...");
                    window.location.href = '/web/pantalla_Inicio/inicio.html';
                    return true;
                }
            } else if (window.supabase) {
                // Si solo tenemos el cliente directo
                const { data } = await window.supabase.auth.getSession();
                
                if (data && data.session) {
                    console.log("Sesión activa detectada con cliente directo - Redirigiendo...");
                    window.location.href = '/web/pantalla_Inicio/inicio.html';
                    return true;
                }
            }
        } catch (error) {
            console.error("Error al verificar sesión:", error);
        }
        
        return false;
    }
    
    // Configurar evento para formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obtener valores del formulario
            const emailInput = loginForm.querySelector('ion-input[type="email"]');
            const passwordInput = loginForm.querySelector('ion-input[type="password"]');
            
            if (!emailInput || !passwordInput) {
                mostrarAlerta("Error en el formulario", "danger");
                return;
            }
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            // Validación básica
            if (!email || !password) {
                mostrarAlerta("Por favor, completa todos los campos", "danger");
                return;
            }
            
            // Mostrar indicador de carga
            const loading = document.createElement('ion-loading');
            loading.message = 'Iniciando sesión...';
            document.body.appendChild(loading);
            await loading.present();
            
            try {
                let userData;
                
                // Intentar iniciar sesión con el servicio
                if (window.supabaseService) {
                    userData = await window.supabaseService.iniciarSesion(email, password);
                } else if (window.supabase) {
                    // Si solo tenemos el cliente directo
                    const { data, error } = await window.supabase.auth.signInWithPassword({
                        email,
                        password
                    });
                    
                    if (error) throw error;
                    userData = data;
                    
                    // Guardar información básica en sessionStorage
                    if (data.user) {
                        sessionStorage.setItem('userId', data.user.id);
                        sessionStorage.setItem('userEmail', data.user.email);
                        sessionStorage.setItem('isAuthenticated', 'true');
                    }
                } else {
                    throw new Error("Cliente Supabase no disponible");
                }
                
                // Cerrar indicador de carga
                await loading.dismiss();
                
                // Mostrar mensaje de éxito
                mostrarAlerta("¡Bienvenido de nuevo!", "success");
                
                // Redirigir después de un breve retraso
                setTimeout(() => {
                    window.location.href = '/web/pantalla_Inicio/inicio.html';
                }, 1500);
                
            } catch (error) {
                // Cerrar indicador de carga
                await loading.dismiss();
                
                console.error("Error al iniciar sesión:", error);
                
                // Mostrar mensaje específico según el error
                if (error.message.includes("Invalid login")) {
                    mostrarAlerta("Usuario o contraseña incorrectos", "danger");
                } else if (error.message.includes("Email not confirmed")) {
                    mostrarAlerta("Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico.", "warning");
                } else {
                    mostrarAlerta("Error al iniciar sesión: " + error.message, "danger");
                }
            }
        });
    }
    
    // Configurar enlace para recuperar contraseña
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function() {
            window.location.href = 'reset-password.html';
        });
    }
    
    // Configurar el botón de inicio de sesión con Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                // Mostrar indicador de carga
                const loading = document.createElement('ion-loading');
                loading.message = 'Conectando con Google...';
                document.body.appendChild(loading);
                await loading.present();
                
                // Llamar a la función de inicio de sesión con Google
                await loginWithGoogle();
                
                // El navegador será redirigido automáticamente por Supabase,
                // por lo que generalmente no llegaremos a este punto
                await loading.dismiss();
            } catch (error) {
                console.error('Error al iniciar sesión con Google:', error);
                
                // Cerrar el indicador de carga si está abierto
                try {
                    const loadingElement = document.querySelector('ion-loading');
                    if (loadingElement) {
                        await loadingElement.dismiss();
                    }
                } catch (dismissError) {
                    console.error('Error al cerrar el indicador de carga:', dismissError);
                }
                
                // Mostrar mensaje de error
                mostrarAlerta('Error al conectar con Google. Por favor, inténtalo nuevamente.', 'danger');
            }
        });
    }
    
    /**
     * Función para iniciar sesión con Google
     * @returns {Promise<void>}
     */
    async function loginWithGoogle() {
        try {
            // Verificar primero si tenemos el servicio completo
            if (window.supabaseService && typeof window.supabaseService.signInWithGoogle === 'function') {
                console.log('Usando supabaseService.signInWithGoogle');
                await window.supabaseService.signInWithGoogle();
                return;
            }
            
            // Si no, verificar que el cliente supabase esté disponible
            const client = window.supabase || 
                          (window.supabaseService ? window.supabaseService.getClient() : null);
            
            if (!client) {
                throw new Error('El cliente de Supabase no está disponible');
            }
            
            // URL de redirección (página de callback para autenticación)
            const redirectTo = window.location.origin + '/web/auth/callback.html';
            
            console.log('Iniciando flujo OAuth con Google, redirigiendo a:', redirectTo);
            
            // Iniciar el flujo de OAuth con Google
            const { data, error } = await client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo
                }
            });
            
            if (error) throw error;
            
            // El navegador será redirigido automáticamente por Supabase
            console.log('Iniciando redirección a Google:', data);
        } catch (error) {
            console.error('Error en loginWithGoogle:', error);
            throw error;
        }
    }
    
    // Función para mostrar alertas - definida en un solo lugar
    async function mostrarAlerta(mensaje, color = 'primary', duracion = 3000) {
        const toast = document.createElement('ion-toast');
        toast.message = mensaje;
        toast.duration = duracion;
        toast.position = 'top';
        toast.color = color;
        document.body.appendChild(toast);
        await toast.present();
    }
});