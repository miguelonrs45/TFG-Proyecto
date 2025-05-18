/**
 * Gestión de reservas para CoWorkGo
 * Conectado con Supabase para mostrar las reservas del usuario
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Inicializando página de mis reservas...");
    
    // Elementos DOM
    const reservationsList = document.getElementById('reservationsList');
    const refresher = document.getElementById('refresher');
    const backButton = document.getElementById('backButton');
    
    // Verificar autenticación
    if (!window.supabaseService) {
        console.error("Servicio Supabase no disponible");
        mostrarToast("Error al cargar servicios necesarios", "danger");
        return;
    }
    
    // Verificar si el usuario está autenticado
    const estaAutenticado = await window.supabaseService.verificarSesion();
    if (!estaAutenticado) {
        window.location.href = '/web/login_registro/iniciosesion.html';
        return;
    }
    
    // Obtener ID del usuario actual
    const userId = await obtenerIdUsuario();
    if (!userId) {
        mostrarToast("No se pudo identificar al usuario", "danger");
        return;
    }
    
    // Añadir manejador para el botón de volver
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            navigateBack();
        });
    }
    
    // Configurar refresher
    if (refresher) {
        refresher.addEventListener('ionRefresh', async function(event) {
            await cargarReservas(userId);
            event.target.complete();
        });
    }
    
    // Cargar reservas al iniciar
    await cargarReservas(userId);
    
    /**
     * Obtiene el ID del usuario actual
     */
    async function obtenerIdUsuario() {
        try {
            // Intentar obtener ID de sesión activa
            const client = window.supabaseService.getClient();
            const { data: sessionData } = await client.auth.getSession();
            
            if (sessionData && sessionData.session && sessionData.session.user) {
                return sessionData.session.user.id;
            }
            
            // Falló la sesión activa, intentar usar sessionStorage como respaldo
            return sessionStorage.getItem('userId');
        } catch (error) {
            console.error("Error al obtener ID de usuario:", error);
            return null;
        }
    }
    
    /**
     * Carga las reservas del usuario desde Supabase
     */
    async function cargarReservas(userId) {
        if (!reservationsList) return;
        
        // Mostrar indicador de carga
        reservationsList.innerHTML = `
            <div class="loading-container ion-padding ion-text-center">
                <ion-spinner name="crescent"></ion-spinner>
                <p>Cargando tus reservas...</p>
            </div>
        `;
        
        try {
            let reservas = [];
            
            // Intentar cargar desde Supabase si el servicio está disponible
            if (window.servicioReservas) {
                reservas = await window.servicioReservas.obtenerReservasUsuario(userId);
            } else {
                // Intentar obtener directamente desde Supabase
                const supabase = window.supabaseService.getClient();
                
                const { data, error } = await supabase
                    .from('Reserva')
                    .select(`
                        *,
                        Espacio_trabajo:id_espacio (
                            nombre,
                            direccion,
                            capacidad,
                            precio_hora,
                            imagen_url
                        )
                    `)
                    .eq('id_usuario', userId)
                    .order('fecha_inicio', { ascending: false });
                
                if (error) throw error;
                reservas = data || [];
            }
            
            // Verificar si hay reservas
            if (!reservas || reservas.length === 0) {
                mostrarEstadoVacio();
                return;
            }
            
            // Filtrar y agrupar reservas
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            const reservasActivas = reservas.filter(r => 
                new Date(r.fecha_inicio) >= hoy && r.estado !== 'cancelada'
            );
            
            const reservasPasadas = reservas.filter(r => 
                new Date(r.fecha_inicio) < hoy || r.estado === 'cancelada'
            );
            
            // Actualizar la interfaz
            actualizarUI(reservasActivas, reservasPasadas);
            
        } catch (error) {
            console.error("Error al cargar reservas:", error);
            mostrarError("No se pudieron cargar tus reservas");
        }
    }
    
    /**
     * Actualiza la interfaz con las reservas cargadas
     */
    function actualizarUI(reservasActivas, reservasPasadas) {
        if (!reservationsList) return;
        
        // Limpiar el contenedor
        reservationsList.innerHTML = '';
        
        // Si no hay reservas activas ni pasadas
        if (reservasActivas.length === 0 && reservasPasadas.length === 0) {
            mostrarEstadoVacio();
            return;
        }
        
        // Añadir encabezado de resumen
        reservationsList.innerHTML = `
            <div class="summary-header">
                <h2>Mis Reservas</h2>
                <p>Tienes ${reservasActivas.length} reservas activas y ${reservasPasadas.length} históricas</p>
            </div>
        `;
        
        // Mostrar reservas activas
        if (reservasActivas.length > 0) {
            const activasSection = document.createElement('div');
            activasSection.innerHTML = `
                <ion-list-header>
                    <ion-label>Reservas Activas</ion-label>
                </ion-list-header>
            `;
            
            // Generar tarjetas de reservas activas
            reservasActivas.forEach(reserva => {
                const card = crearTarjetaReserva(reserva, true);
                activasSection.appendChild(card);
            });
            
            reservationsList.appendChild(activasSection);
        }
        
        // Mostrar reservas pasadas
        if (reservasPasadas.length > 0) {
            const pasadasSection = document.createElement('div');
            pasadasSection.innerHTML = `
                <ion-list-header>
                    <ion-label>Historial de Reservas</ion-label>
                </ion-list-header>
            `;
            
            // Generar tarjetas de reservas pasadas
            reservasPasadas.forEach(reserva => {
                const card = crearTarjetaReserva(reserva, false);
                pasadasSection.appendChild(card);
            });
            
            reservationsList.appendChild(pasadasSection);
        }
    }
    
    /**
     * Crea una tarjeta para una reserva
     */
    function crearTarjetaReserva(reserva, activa) {
        const card = document.createElement('div');
        card.className = 'reservation-card';
        
        // Formatear fechas
        const fechaVisita = new Date(reserva.fecha_inicio);
        const horaInicio = formatearHora(fechaVisita);
        const horaFin = formatearHora(new Date(reserva.fecha_fin));
        
        // Obtener nombre del espacio
        const nombreEspacio = reserva.Espacio_trabajo ? 
            reserva.Espacio_trabajo.nombre : 
            'Espacio de trabajo';
            
        // Obtener dirección del espacio
        const direccionEspacio = reserva.Espacio_trabajo ? 
            reserva.Espacio_trabajo.direccion : 
            '';
        
        // Estado
        const estado = reserva.estado === 'cancelada' ? 
            '<span class="status-canceled">Cancelada</span>' : 
            (activa ? '<span class="status-active">Activa</span>' : '<span class="status-past">Completada</span>');
        
        // Construir HTML de la tarjeta
        card.innerHTML = `
            <div class="reservation-header">
                <div class="reservation-date">
                    ${formatearFecha(fechaVisita)}
                </div>
                <div class="reservation-status">
                    ${estado}
                </div>
            </div>
            
            <div class="reservation-details">
                <div class="detail-item">
                    <ion-icon name="business-outline"></ion-icon>
                    <span>${nombreEspacio}</span>
                </div>
                <div class="detail-item">
                    <ion-icon name="location-outline"></ion-icon>
                    <span>${direccionEspacio}</span>
                </div>
                <div class="detail-item">
                    <ion-icon name="time-outline"></ion-icon>
                    <span>${horaInicio} - ${horaFin}</span>
                </div>
                <div class="detail-item">
                    <ion-icon name="cash-outline"></ion-icon>
                    <span>${reserva.precio_total.toFixed(2)}€</span>
                </div>
            </div>
            
            ${activa ? `
                <div class="reservation-actions">
                    <ion-button fill="outline" class="details-btn" data-id="${reserva.id_reserva}">
                        <ion-icon name="information-circle-outline" slot="start"></ion-icon>
                        Detalles
                    </ion-button>
                    <ion-button fill="outline" color="danger" class="cancel-btn" data-id="${reserva.id_reserva}">
                        <ion-icon name="close-circle-outline" slot="start"></ion-icon>
                        Cancelar
                    </ion-button>
                </div>
            ` : `
                <div class="reservation-actions">
                    <ion-button fill="outline" class="details-btn" data-id="${reserva.id_reserva}">
                        <ion-icon name="information-circle-outline" slot="start"></ion-icon>
                        Detalles
                    </ion-button>
                </div>
            `}
        `;
        
        // Agregar eventos a los botones
        if (activa) {
            const cancelBtn = card.querySelector(`.cancel-btn[data-id="${reserva.id_reserva}"]`);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => cancelarReserva(reserva.id_reserva));
            }
        }
        
        const detailsBtn = card.querySelector(`.details-btn[data-id="${reserva.id_reserva}"]`);
        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => verDetallesReserva(reserva.id_reserva));
        }
        
        return card;
    }
    
    /**
     * Muestra el estado vacío cuando no hay reservas
     */
    function mostrarEstadoVacio() {
        if (!reservationsList) return;
        
        reservationsList.innerHTML = `
            <div class="empty-state">
                <ion-icon name="calendar-outline"></ion-icon>
                <h2>No tienes reservas</h2>
                <p>Cuando reserves un espacio, aparecerá aquí</p>
                <ion-button href="reservar.html">
                    Hacer una reserva
                </ion-button>
            </div>
        `;
    }
    
    /**
     * Cancela una reserva
     */
    async function cancelarReserva(idReserva) {
        // Mostrar confirmación
        const alert = document.createElement('ion-alert');
        alert.header = 'Confirmar cancelación';
        alert.message = '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.';
        alert.buttons = [
            {
                text: 'No',
                role: 'cancel'
            },
            {
                text: 'Sí, cancelar',
                handler: async () => {
                    try {
                        // Mostrar indicador de carga
                        const loading = document.createElement('ion-loading');
                        loading.message = 'Cancelando reserva...';
                        document.body.appendChild(loading);
                        await loading.present();
                        
                        // Cancelar reserva en Supabase
                        if (window.servicioReservas) {
                            await window.servicioReservas.cancelarReserva(idReserva);
                        } else {
                            // Fallback: cancelar directamente
                            const supabase = window.supabaseService.getClient();
                            await supabase
                                .from('Reserva')
                                .update({ estado: 'cancelada' })
                                .eq('id_reserva', idReserva);
                        }
                        
                        // Cerrar indicador
                        await loading.dismiss();
                        
                        // Mostrar confirmación
                        mostrarToast('Reserva cancelada con éxito', 'success');
                        
                        // Recargar reservas
                        await cargarReservas(await obtenerIdUsuario());
                        
                    } catch (error) {
                        console.error('Error al cancelar reserva:', error);
                        mostrarToast('Error al cancelar la reserva', 'danger');
                    }
                }
            }
        ];
        
        document.body.appendChild(alert);
        await alert.present();
    }
    
    /**
     * Ver detalles de una reserva
     */
    function verDetallesReserva(idReserva) {
        console.log('Ver detalles de reserva:', idReserva);
        // Para futura implementación
        mostrarToast('Detalles de reserva - Próximamente', 'primary');
    }
    
    /**
     * Funciones de utilidad
     */
    function formatearFecha(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    function formatearHora(fecha) {
        return fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function navigateBack() {
        window.location.href = '/web/pantalla_Inicio/inicio.html';
    }
    
    function mostrarError(mensaje) {
        if (!reservationsList) return;
        
        reservationsList.innerHTML = `
            <div class="error-state ion-padding ion-text-center">
                <ion-icon name="alert-circle-outline" color="danger" style="font-size: 48px;"></ion-icon>
                <h2>${mensaje}</h2>
                <ion-button onclick="window.location.reload()">
                    Reintentar
                </ion-button>
            </div>
        `;
    }
    
    async function mostrarToast(mensaje, color = 'primary', duracion = 2000) {
        const toast = document.createElement('ion-toast');
        toast.message = mensaje;
        toast.duration = duracion;
        toast.position = 'bottom';
        toast.color = color;
        
        document.body.appendChild(toast);
        await toast.present();
    }
});