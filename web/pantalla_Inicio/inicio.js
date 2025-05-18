/**
 * Pantalla de inicio para CoWorkGo
 * Conectado con Supabase para mostrar información personalizada
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Inicializando pantalla de inicio...");
    
    // Verificar autenticación
    if (!window.supabaseService) {
        console.log("Servicio Supabase no disponible - cargando dinámicamente");
        const script = document.createElement('script');
        script.src = '/web/conexion/services/supabase-service.js';
        document.head.appendChild(script);
        
        // Esperar a que el servicio esté disponible
        await new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (window.supabaseService) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
    
    // Verificar si hay sesión activa
    const estaAutenticado = await window.supabaseService.verificarSesion();
    if (!estaAutenticado) {
        window.location.href = '/web/login_registro/iniciosesion.html';
        return;
    }
    
    // Cargar datos del usuario y configurar eventos
    await cargarDatosUsuario();
    configurarEventos();
    
    // Cargar resumen de reservas
    if (typeof window.servicioReservas !== 'undefined') {
        await cargarResumenReservas();
    } else {
        console.log("Servicio de reservas no disponible");
    }
    
    /**
     * Carga los datos del usuario desde Supabase o sessionStorage
     */
    async function cargarDatosUsuario() {
        try {
            // Obtener sesión actual
            const client = window.supabaseService.getClient();
            const { data: sessionData } = await client.auth.getSession();
            
            if (!sessionData || !sessionData.session) {
                throw new Error("No hay sesión activa");
            }
            
            const userId = sessionData.session.user.id;
            
            // Cargar datos del usuario
            const userData = await window.supabaseService.cargarDatosUsuario(userId);
            
            // Actualizar saludo con nombre del usuario
            const headerTitle = document.querySelector('.header-title');
            if (headerTitle) {
                const nombre = userData?.nombre || sessionStorage.getItem('userName') || 'Usuario';
                headerTitle.textContent = `¡Bienvenido de nuevo, ${nombre}!`;
            }
            
        } catch (error) {
            console.error("Error al cargar datos del usuario:", error);
            
            // Usar datos de respaldo desde sessionStorage
            const userName = sessionStorage.getItem('userName');
            if (userName) {
                const headerTitle = document.querySelector('.header-title');
                if (headerTitle) {
                    headerTitle.textContent = `¡Bienvenido de nuevo, ${userName}!`;
                }
            }
        }
    }
    
    /**
     * Configura los eventos de los elementos interactivos
     */
    function configurarEventos() {
        // Configurar tarjetas de acción
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', function() {
                const url = this.getAttribute('onclick');
                if (url) {
                    // Extraer la URL del onclick
                    const match = url.match(/window\.location\.href\s*=\s*['"](.*)['"]/);
                    if (match && match[1]) {
                        window.location.href = match[1];
                    }
                }
            });
        });
        
        // Configurar botones de la toolbar
        const notificationsButton = document.querySelector('ion-button ion-icon[name="notifications-outline"]');
        if (notificationsButton) {
            const parentButton = notificationsButton.closest('ion-button');
            if (parentButton) {
                parentButton.addEventListener('click', async () => {
                    mostrarToast('No tienes notificaciones nuevas', 'primary');
                });
            }
        }
        
        const profileButton = document.querySelector('ion-button ion-icon[name="person-circle-outline"]');
        if (profileButton) {
            const parentButton = profileButton.closest('ion-button');
            if (parentButton) {
                parentButton.addEventListener('click', () => {
                    window.location.href = '/web/menus/perfil.html';
                });
            }
        }
    }
    
    /**
     * Carga el resumen de reservas activas del usuario
     */
    async function cargarResumenReservas() {
        try {
            // Obtener ID del usuario actual
            const client = window.supabaseService.getClient();
            const { data: sessionData } = await client.auth.getSession();
            
            if (!sessionData || !sessionData.session) {
                throw new Error("No hay sesión activa");
            }
            
            const userId = sessionData.session.user.id;
            
            // Obtener reservas del usuario
            const reservas = await window.servicioReservas.obtenerReservasUsuario(userId);
            
            // Filtrar y ordenar reservas activas
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            const reservasActivas = reservas
                .filter(r => new Date(r.fecha_inicio) >= hoy && r.estado !== 'cancelada')
                .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
            
            // Mostrar resumen en la interfaz
            mostrarResumenReservas(reservasActivas);
            
        } catch (error) {
            console.error("Error al cargar resumen de reservas:", error);
            // No mostramos error al usuario para no interrumpir la experiencia
        }
    }
    
    /**
     * Muestra el resumen de reservas en la interfaz
     */
    function mostrarResumenReservas(reservasActivas) {
        // Crear contenedor para el resumen si no existe
        let resumenContainer = document.querySelector('.stats-container');
        
        if (!resumenContainer) {
            // Si no existe, crear uno nuevo
            resumenContainer = document.createElement('div');
            resumenContainer.className = 'stats-container';
            
            // Buscar dónde insertarlo (después de quick-actions)
            const quickActions = document.querySelector('.quick-actions');
            if (quickActions) {
                quickActions.after(resumenContainer);
            } else {
                // Si no hay quick-actions, insertarlo al final del contenido
                document.querySelector('ion-content').appendChild(resumenContainer);
            }
        }
        
        // Si no hay reservas activas
        if (!reservasActivas || reservasActivas.length === 0) {
            resumenContainer.innerHTML = `
                <div class="stat-card">
                    <ion-icon name="calendar-outline"></ion-icon>
                    <div>
                        <h4>Sin reservas próximas</h4>
                        <p>No tienes reservas programadas</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Mostrar la próxima reserva
        const proximaReserva = reservasActivas[0];
        const fechaReserva = new Date(proximaReserva.fecha_inicio);
        
        // Mostrar información
        resumenContainer.innerHTML = `
            <div class="stat-card">
                <ion-icon name="calendar-outline"></ion-icon>
                <div>
                    <h4>Próxima reserva: ${formatearFecha(fechaReserva)}</h4>
                    <p>
                        ${proximaReserva.Espacio_trabajo?.nombre || 'Espacio de trabajo'} 
                        - ${formatearHora(fechaReserva)}
                    </p>
                </div>
            </div>
            
            <div class="stat-card">
                <ion-icon name="stats-chart-outline"></ion-icon>
                <div>
                    <h4>Total reservas activas</h4>
                    <p>${reservasActivas.length} reserva${reservasActivas.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Formatea una fecha para mostrarla de forma legible
     */
    function formatearFecha(fecha) {
        try {
            return fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
        } catch (error) {
            return fecha.toString();
        }
    }
    
    /**
     * Formatea una hora para mostrarla de forma legible
     */
    function formatearHora(fecha) {
        try {
            return fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return fecha.toString();
        }
    }
    
    /**
     * Muestra un toast con mensaje
     */
    async function mostrarToast(mensaje, color = 'primary', duracion = 2000) {
        const toast = document.createElement('ion-toast');
        toast.message = mensaje;
        toast.duration = duracion;
        toast.position = 'top';
        toast.color = color;
        
        document.body.appendChild(toast);
        await toast.present();
    }
});