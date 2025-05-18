/**
 * Servicio Supabase unificado para CoWorkGo
 * Proporciona inicialización global y funciones de autenticación y datos
 */
(function() {
    // Configuración de Supabase
    const supabaseUrl = 'https://dvtkkaxjehfotylwwsea.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtrYXhqZWhmb3R5bHd3c2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyOTUsImV4cCI6MjA1ODQwNzI5NX0.VjR1V7PBZuOtvSUIOnjrXBb_O-w6W2wabHhjahaom1A';
    
    // Variable para almacenar el cliente Supabase
    let supabaseClient = null;
    
    // Inicialización para entorno de navegador
    if (typeof window !== 'undefined') {
        // Cargar la biblioteca Supabase desde CDN si no está ya cargada
        if (typeof supabaseJs === 'undefined') {
            console.log('Cargando Supabase desde CDN...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
            script.async = false;
            script.onload = function() {
                console.log('Supabase cargado desde CDN');
                // Crear cliente cuando la biblioteca esté cargada
                window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
                supabaseClient = window.supabase;
                
                // Notificar que el cliente está listo
                window.dispatchEvent(new Event('supabaseReady'));
            };
            document.head.appendChild(script);
        } else {
            // Si ya está cargada, crear el cliente directamente
            try {
                window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
                supabaseClient = window.supabase;
                console.log('Cliente Supabase creado con biblioteca existente');
            } catch (error) {
                console.error('Error al crear cliente Supabase:', error);
            }
        }
    }
    
    // Métodos del servicio
    const supabaseService = {
        /**
         * Obtiene el cliente Supabase
         */
        getClient: function() {
            return window.supabase || supabaseClient;
        },
        
        /**
         * Verifica si hay una sesión activa
         */
        verificarSesion: async function() {
            try {
                const client = this.getClient();
                if (!client) {
                    console.error('Cliente Supabase no disponible');
                    return false;
                }
                
                const { data, error } = await client.auth.getSession();
                if (error) {
                    console.error('Error al verificar sesión:', error);
                    return false;
                }
                
                return !!(data && data.session);
            } catch (error) {
                console.error('Error en verificarSesion:', error);
                return false;
            }
        },
        
        /**
         * Inicia sesión con correo electrónico y contraseña
         */
        iniciarSesion: async function(email, password) {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                const { data, error } = await client.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // Guardar información básica en sessionStorage
                if (data.user) {
                    sessionStorage.setItem('userId', data.user.id);
                    sessionStorage.setItem('userEmail', data.user.email);
                    sessionStorage.setItem('isAuthenticated', 'true');
                }
                
                return data;
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                throw error;
            }
        },
        
        /**
         * Inicia sesión con Google mediante OAuth
         * @param {string} redirectUrl - URL opcional de redirección después de la autenticación
         * @returns {Promise<Object>} - Datos de la autenticación
         */
        signInWithGoogle: async function(redirectUrl) {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                // Si no se proporciona URL de redirección, usar la del sitio actual + callback
                if (!redirectUrl) {
                    redirectUrl = window.location.origin + '/web/auth/callback.html';
                }
                
                console.log('Iniciando autenticación con Google. URL de redirección:', redirectUrl);
                
                // Detectar si estamos en un entorno móvil o web
                const isApp = typeof navigator !== 'undefined' && 
                    (navigator.userAgent.includes('Capacitor') || 
                     navigator.userAgent.includes('Cordova'));
                
                // Opciones específicas según el entorno
                const options = {
                    redirectTo: redirectUrl,
                    // Evitar redirección automática del navegador en apps nativas
                    skipBrowserRedirect: isApp
                };
                
                // Iniciar el flujo de OAuth con Google
                const { data, error } = await client.auth.signInWithOAuth({
                    provider: 'google',
                    options: options
                });
                
                if (error) throw error;
                
                console.log('Inicializando autenticación con Google:', data);
                return data;
            } catch (error) {
                console.error('Error al iniciar sesión con Google:', error);
                throw error;
            }
        },
        
        /**
         * Procesa la respuesta de autenticación OAuth
         * @returns {Promise<Object>} - Datos de la sesión
         */
        procesarRespuestaAuth: async function() {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                // Verificar si hay una sesión existente
                const { data, error } = await client.auth.getSession();
                
                if (error) throw error;
                
                // Si hay una sesión, guardar datos básicos
                if (data && data.session && data.session.user) {
                    const user = data.session.user;
                    sessionStorage.setItem('userId', user.id);
                    sessionStorage.setItem('userEmail', user.email);
                    sessionStorage.setItem('isAuthenticated', 'true');
                    
                    // Si hay metadata de usuario, guardarla también
                    if (user.user_metadata) {
                        if (user.user_metadata.full_name) {
                            sessionStorage.setItem('userName', user.user_metadata.full_name);
                        }
                        if (user.user_metadata.name) {
                            sessionStorage.setItem('userName', user.user_metadata.name);
                        }
                        if (user.user_metadata.avatar_url) {
                            sessionStorage.setItem('userAvatar', user.user_metadata.avatar_url);
                        }
                    }
                    
                    // Verificar si necesitamos crear un perfil de usuario
                    try {
                        const { data: usuarioData } = await client
                            .from('usuario')
                            .select('*')
                            .eq('id_usuario', user.id)
                            .single();
                        
                        // Si no existe un perfil, crearlo automáticamente
                        if (!usuarioData) {
                            await client.from('usuario').insert([{
                                id_usuario: user.id,
                                nombre: user.user_metadata?.full_name || user.user_metadata?.name || '',
                                email: user.email,
                                fecha_registro: new Date().toISOString(),
                                verificado: true // Autenticación con Google ya está verificada
                            }]);
                        }
                    } catch (profileError) {
                        console.warn('Error al gestionar perfil de usuario:', profileError);
                    }
                }
                
                return data;
            } catch (error) {
                console.error('Error al procesar respuesta de autenticación:', error);
                throw error;
            }
        },
        
        /**
         * Registra un nuevo usuario
         */
        registrarUsuario: async function(email, password, userData = {}) {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                const { data, error } = await client.auth.signUp({
                    email,
                    password,
                    options: {
                        data: userData
                    }
                });
                
                if (error) throw error;
                
                // Si el usuario se creó correctamente, guardar datos en la tabla
                if (data.user) {
                    const { error: profileError } = await client
                        .from('usuario')
                        .insert([{
                            id_usuario: data.user.id,
                            nombre: userData.nombre || '',
                            apellidos: userData.apellidos || '',
                            email: email,
                            fecha_registro: new Date().toISOString(),
                            verificado: false
                        }]);
                    
                    if (profileError) {
                        console.error('Error al crear perfil:', profileError);
                    }
                }
                
                return data;
            } catch (error) {
                console.error('Error al registrar usuario:', error);
                throw error;
            }
        },
        
        /**
         * Cierra la sesión del usuario actual
         */
        cerrarSesion: async function() {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                const { error } = await client.auth.signOut();
                
                // Limpiar almacenamiento local
                sessionStorage.clear();
                
                // Limpiar tokens de Supabase en localStorage
                for (let key in localStorage) {
                    if (key.startsWith('sb-')) {
                        localStorage.removeItem(key);
                    }
                }
                
                if (error) throw error;
                
                return { success: true };
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                
                // Intentar limpiar almacenamiento de todos modos
                sessionStorage.clear();
                for (let key in localStorage) {
                    if (key.startsWith('sb-')) {
                        localStorage.removeItem(key);
                    }
                }
                
                throw error;
            }
        },
        
        /**
         * Restablece la contraseña de un usuario
         */
        restablecerPassword: async function(email, redirectUrl) {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                const { error } = await client.auth.resetPasswordForEmail(email, {
                    redirectTo: redirectUrl
                });
                
                if (error) throw error;
                
                return { success: true };
            } catch (error) {
                console.error('Error al solicitar restablecimiento:', error);
                throw error;
            }
        },
        
        /**
         * Actualiza la contraseña del usuario
         */
        actualizarPassword: async function(newPassword) {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                const { error } = await client.auth.updateUser({
                    password: newPassword
                });
                
                if (error) throw error;
                
                return { success: true };
            } catch (error) {
                console.error('Error al actualizar contraseña:', error);
                throw error;
            }
        },
        
        /**
         * Carga los datos del usuario actual
         */
        cargarDatosUsuario: async function(userId) {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                const { data, error } = await client
                    .from('usuario')
                    .select('*')
                    .eq('id_usuario', userId)
                    .single();
                
                if (error) throw error;
                
                // Guardar datos en sessionStorage
                if (data) {
                    sessionStorage.setItem('userName', data.nombre || '');
                    sessionStorage.setItem('userLastName', data.apellidos || '');
                    sessionStorage.setItem('userVerified', data.verificado || false);
                    
                    // Guardar otros datos si existen
                    if (data.theme_preference) {
                        sessionStorage.setItem('theme', data.theme_preference);
                    }
                }
                
                return data;
            } catch (error) {
                console.error('Error al cargar datos de usuario:', error);
                return null;
            }
        },
        
        /**
         * Actualiza los datos del perfil de usuario
         */
        actualizarPerfil: async function(userId, userData) {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                const { error } = await client
                    .from('usuario')
                    .update(userData)
                    .eq('id_usuario', userId);
                
                if (error) throw error;
                
                return { success: true };
            } catch (error) {
                console.error('Error al actualizar perfil:', error);
                throw error;
            }
        },
        
        /**
         * Guarda las preferencias del usuario
         */
        guardarPreferencias: async function(userId, preferences) {
            try {
                const client = this.getClient();
                if (!client) {
                    throw new Error('Cliente Supabase no disponible');
                }
                
                // Actualizar solo los campos de preferencias
                const prefData = {};
                if (preferences.theme) prefData.theme_preference = preferences.theme;
                if (preferences.notifications !== undefined) prefData.notifications_enabled = preferences.notifications;
                
                const { error } = await client
                    .from('usuario')
                    .update(prefData)
                    .eq('id_usuario', userId);
                
                if (error) throw error;
                
                return { success: true };
            } catch (error) {
                console.error('Error al guardar preferencias:', error);
                throw error;
            }
        }
    };
    
    // Hacer disponible globalmente para scripts tradicionales
    if (typeof window !== 'undefined') {
        window.supabaseService = supabaseService;
    }
    
    // Exportar para ES modules
    if (typeof exports !== 'undefined') {
        exports.supabaseService = supabaseService;
    }
})();