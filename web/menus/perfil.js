/**
 * Perfil de usuario para CoWorkGo
 * Utiliza servicios para gestionar datos y autenticación
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando página de perfil...");
    
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
                inicializarPerfil();
            }
        }, 100);
    } else {
        inicializarPerfil();
    }
    
    function inicializarPerfil() {
        cargarDatosPerfil();
        configurarEventos();
        
        // Botón de volver
        const backButton = document.querySelector('ion-back-button');
        if (backButton) {
            backButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = '/web/pantalla_Inicio/inicio.html';
            });
        }
    }
    
    async function cargarDatosPerfil() {
        // Cargar datos desde sessionStorage
        const userName = sessionStorage.getItem('userName') || 'Usuario';
        const userEmail = sessionStorage.getItem('userEmail') || 'usuario@email.com';
        const userLastName = sessionStorage.getItem('userLastName') || '';
        const notifications = sessionStorage.getItem('notifications') === 'true';
        const currentTheme = sessionStorage.getItem('theme') || 'light';
        
        // Actualizar interfaz con datos básicos
        document.getElementById('userName').textContent = userName;
        document.getElementById('userEmail').textContent = userEmail;
        document.getElementById('fullName').textContent = `${userName} ${userLastName}`.trim();
        document.getElementById('department').textContent = sessionStorage.getItem('userDepartment') || 'No especificado';
        document.getElementById('position').textContent = sessionStorage.getItem('userPosition') || 'No especificado';
        
        // Configurar preferencias
        const notificationsToggle = document.getElementById('notificationsToggle');
        if (notificationsToggle) {
            notificationsToggle.checked = notifications !== null ? notifications : true;
        }
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = currentTheme;
        }
        
        // Aplicar tema
        applyTheme(currentTheme);
        
        try {
            // Si está disponible Supabase, intentar cargar datos actualizados
            if (window.supabaseService) {
                // Verificar sesión
                const sesionActiva = await window.supabaseService.verificarSesion();
                
                if (!sesionActiva) {
                    console.log("No hay sesión activa - Redirigiendo a login");
                    window.location.href = '/web/login_registro/iniciosesion.html';
                    return;
                }
                
                // Obtener ID de usuario desde la sesión
                const client = window.supabaseService.getClient();
                const { data: sessionData } = await client.auth.getSession();
                
                if (sessionData && sessionData.session) {
                    const userId = sessionData.session.user.id;
                    
                    // Cargar datos actualizados
                    const userData = await window.supabaseService.cargarDatosUsuario(userId);
                    
                    if (userData) {
                        // Actualizar interfaz con datos frescos
                        document.getElementById('userName').textContent = userData.nombre || userName;
                        document.getElementById('fullName').textContent = 
                            `${userData.nombre || ''} ${userData.apellidos || ''}`.trim() || userName;
                        
                        // Solo actualizar email si está disponible
                        if (userData.email) {
                            document.getElementById('userEmail').textContent = userData.email;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error al cargar datos desde Supabase:", error);
            
            // Si hay error de autenticación, redirigir a login
            if (error.message && (
                error.message.includes("not authenticated") || 
                error.message.includes("JWT expired") ||
                error.message.includes("token expired")
            )) {
                window.location.href = '/web/login_registro/iniciosesion.html';
            }
        }
    }
    
    function configurarEventos() {
        // Editar perfil
        const editProfileButton = document.getElementById('editProfileButton');
        if (editProfileButton) {
            editProfileButton.addEventListener('click', function() {
                showEditProfileModal();
            });
        }
        
        // Notificaciones
        const notificationsToggle = document.getElementById('notificationsToggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('ionChange', function(ev) {
                const isEnabled = ev.detail.checked;
                updateNotificationPreference(isEnabled);
            });
        }
        
        // Tema
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('ionChange', function(ev) {
                updateThemePreference(ev.detail.value);
            });
        }
    }
    
    async function showEditProfileModal() {
        const alert = document.createElement('ion-alert');
        alert.header = 'Editar Perfil';
        alert.inputs = [
            {
                name: 'name',
                type: 'text',
                placeholder: 'Nombre completo',
                value: document.getElementById('fullName').textContent
            },
            {
                name: 'department',
                type: 'text',
                placeholder: 'Departamento',
                value: document.getElementById('department').textContent
            },
            {
                name: 'position',
                type: 'text',
                placeholder: 'Cargo',
                value: document.getElementById('position').textContent
            }
        ];
        alert.buttons = [
            {
                text: 'Cancelar',
                role: 'cancel'
            },
            {
                text: 'Guardar',
                handler: async (data) => {
                    try {
                        // Actualizar interfaz
                        document.getElementById('fullName').textContent = data.name;
                        document.getElementById('department').textContent = data.department;
                        document.getElementById('position').textContent = data.position;
                        
                        // Separar nombre y apellidos
                        const nameParts = data.name.split(' ');
                        const nombre = nameParts[0] || '';
                        const apellidos = nameParts.slice(1).join(' ') || '';
                        
                        // Actualizar nombre visible
                        document.getElementById('userName').textContent = nombre;
                        
                        // Guardar en sessionStorage
                        sessionStorage.setItem('userName', nombre);
                        sessionStorage.setItem('userLastName', apellidos);
                        sessionStorage.setItem('userDepartment', data.department);
                        sessionStorage.setItem('userPosition', data.position);
                        
                        // Actualizar en Supabase si está disponible
                        if (window.supabaseService) {
                            // Obtener ID de usuario desde la sesión
                            const client = window.supabaseService.getClient();
                            const { data: sessionData } = await client.auth.getSession();
                            
                            if (sessionData && sessionData.session) {
                                const userId = sessionData.session.user.id;
                                
                                // Actualizar datos en Supabase
                                await window.supabaseService.actualizarPerfil(userId, {
                                    nombre: nombre,
                                    apellidos: apellidos,
                                    departamento: data.department,
                                    cargo: data.position
                                });
                            }
                        }
                        
                        showToast('Perfil actualizado correctamente');
                    } catch (error) {
                        console.error("Error al actualizar perfil:", error);
                        showToast('Error al actualizar perfil', 'danger');
                    }
                }
            }
        ];

        document.body.appendChild(alert);
        await alert.present();
    }
    
    async function updateNotificationPreference(enabled) {
        // Guardar en sessionStorage
        sessionStorage.setItem('notifications', enabled);
        
        // Mostrar confirmación
        showToast(`Notificaciones ${enabled ? 'activadas' : 'desactivadas'}`);
        
        // Actualizar en Supabase si está disponible
        try {
            if (window.supabaseService) {
                // Obtener ID de usuario desde la sesión
                const client = window.supabaseService.getClient();
                const { data: sessionData } = await client.auth.getSession();
                
                if (sessionData && sessionData.session) {
                    const userId = sessionData.session.user.id;
                    
                    // Guardar preferencia
                    await window.supabaseService.guardarPreferencias(userId, {
                        notifications: enabled
                    });
                }
            }
        } catch (error) {
            console.error("Error al guardar preferencia de notificaciones:", error);
        }
    }
    
    async function updateThemePreference(theme) {
        // Guardar en sessionStorage
        sessionStorage.setItem('theme', theme);
        
        // Aplicar tema
        applyTheme(theme);
        
        // Mostrar confirmación
        showToast(`Tema ${theme === 'dark' ? 'oscuro' : 'claro'} aplicado`);
        
        // Actualizar en Supabase si está disponible
        try {
            if (window.supabaseService) {
                // Obtener ID de usuario desde la sesión
                const client = window.supabaseService.getClient();
                const { data: sessionData } = await client.auth.getSession();
                
                if (sessionData && sessionData.session) {
                    const userId = sessionData.session.user.id;
                    
                    // Guardar preferencia
                    await window.supabaseService.guardarPreferencias(userId, {
                        theme: theme
                    });
                }
            }
        } catch (error) {
            console.error("Error al guardar preferencia de tema:", error);
        }
    }
    
    function applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        
        if (theme === 'dark') {
            document.body.style.setProperty('--ion-background-color', '#121212');
            document.body.style.setProperty('--ion-text-color', '#ffffff');
            document.body.style.setProperty('--ion-toolbar-background', '#1e1e1e');
            document.body.style.setProperty('--ion-item-background', '#1e1e1e');
            document.body.style.setProperty('--ion-card-background', '#1e1e1e');
            // Más variables...
        } else {
            document.body.style.setProperty('--ion-background-color', '#ffffff');
            document.body.style.setProperty('--ion-text-color', '#000000');
            document.body.style.setProperty('--ion-toolbar-background', '#f8f9fa');
            document.body.style.setProperty('--ion-item-background', '#ffffff');
            document.body.style.setProperty('--ion-card-background', '#ffffff');
            // Más variables...
        }
        
        // Si existe la función global, también usarla
        if (typeof window.applyGlobalTheme === 'function') {
            window.applyGlobalTheme();
        }
    }
    
    async function showToast(message, color = 'success', duration = 2000) {
        const toast = document.createElement('ion-toast');
        toast.message = message;
        toast.duration = duration;
        toast.position = 'top';
        toast.color = color;

        document.body.appendChild(toast);
        await toast.present();
    }
});