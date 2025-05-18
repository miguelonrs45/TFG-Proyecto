/**
 * Gestión de espacios para CoWorkGo
 * Conectado con Supabase para mostrar espacios de trabajo reales
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Inicializando página de espacios...");
    
    // Elementos DOM
    const ubicacionesContainer = document.getElementById('ubicaciones-container');
    const noEspaciosElement = document.getElementById('no-espacios');
    
    // Verificar si el servicio está disponible
    if (!window.servicioReservas) {
        console.error("Servicio de reservas no disponible");
        mostrarError("No se pudo cargar el servicio de reservas. Por favor, recarga la página.");
        return;
    }
    
    // Mostrar indicador de carga
    mostrarCargando();
    
    try {
        // Cargar espacios desde Supabase
        const espacios = await window.servicioReservas.obtenerTodosLosEspacios();
        
        if (!espacios || espacios.length === 0) {
            // Mostrar mensaje si no hay espacios
            if (noEspaciosElement) noEspaciosElement.style.display = 'flex';
            ocultarCargando();
            return;
        }
        
        // Agrupar espacios por ciudad/ubicación
        const espaciosPorUbicacion = agruparEspaciosPorUbicacion(espacios);
        
        // Renderizar espacios agrupados
        renderizarUbicaciones(espaciosPorUbicacion);
        
        // Ocultar indicador de carga
        ocultarCargando();
        
    } catch (error) {
        console.error("Error al cargar espacios:", error);
        mostrarError("Error al cargar los espacios. Por favor, inténtalo de nuevo más tarde.");
        ocultarCargando();
    }
    
    /**
     * Agrupa los espacios por ubicación
     */
    function agruparEspaciosPorUbicacion(espacios) {
        // Crear un mapa para agrupar espacios por ubicación
        const ubicaciones = {};
        
        espacios.forEach(espacio => {
            // Extraer ciudad de la dirección
            const direccionParts = espacio.direccion.split(',');
            let ciudad = 'Otra ubicación';
            
            if (direccionParts.length >= 2) {
                // Intentar extraer ciudad del último elemento (asumiendo formato "calle, número, ciudad")
                ciudad = direccionParts[direccionParts.length - 1].trim();
            } else if (direccionParts.length === 1 && direccionParts[0].includes(' ')) {
                // Intento alternativo: último término de la dirección
                const terms = direccionParts[0].trim().split(' ');
                ciudad = terms[terms.length - 1];
            }
            
            // Inicializar el array si no existe
            if (!ubicaciones[ciudad]) {
                ubicaciones[ciudad] = {
                    ciudad: ciudad,
                    expandido: Object.keys(ubicaciones).length === 0, // Expandir solo la primera
                    espacios: []
                };
            }
            
            // Agregar el espacio a la ubicación correspondiente
            ubicaciones[ciudad].espacios.push(espacio);
        });
        
        // Convertir el mapa en un array
        return Object.values(ubicaciones);
    }
    
    /**
     * Renderiza las ubicaciones y sus espacios
     */
    function renderizarUbicaciones(ubicaciones) {
        if (!ubicacionesContainer) return;
        
        ubicacionesContainer.innerHTML = '';
        
        ubicaciones.forEach(ubicacion => {
            // Crear sección de ubicación
            const ubicacionSection = document.createElement('div');
            ubicacionSection.className = 'ubicacion-section';
      
            // Crear tarjeta de ubicación (cabecera)
            const ubicacionCard = document.createElement('ion-card');
            ubicacionCard.className = 'ubicacion-card';
            ubicacionCard.innerHTML = `
                <ion-item lines="none" class="ubicacion-header">
                    <ion-icon name="location-outline" slot="start"></ion-icon>
                    <ion-label>
                        <h2>${ubicacion.ciudad}</h2>
                        <p>${ubicacion.espacios.length} espacios disponibles</p>
                    </ion-label>
                    <ion-icon
                        name="${ubicacion.expandido ? 'chevron-up-outline' : 'chevron-down-outline'}"
                        slot="end"
                        class="expand-icon">
                    </ion-icon>
                </ion-item>
            `;
      
            // Agregar evento para expandir/colapsar
            ubicacionCard.addEventListener('click', () => {
                toggleUbicacion(ubicacion, ubicacionSection);
            });
      
            ubicacionSection.appendChild(ubicacionCard);
      
            // Crear contenedor de espacios
            const espaciosList = document.createElement('div');
            espaciosList.className = 'espacios-list';
            espaciosList.style.display = ubicacion.expandido ? 'grid' : 'none';
      
            // Agregar cada espacio a la lista
            ubicacion.espacios.forEach(espacio => {
                const espacioCard = crearTarjetaEspacio(espacio);
                espaciosList.appendChild(espacioCard);
            });
      
            ubicacionSection.appendChild(espaciosList);
            ubicacionesContainer.appendChild(ubicacionSection);
        });
    }
    
    /**
     * Crea una tarjeta para un espacio
     */
    function crearTarjetaEspacio(espacio) {
        const espacioCard = document.createElement('ion-card');
        espacioCard.className = 'espacio-card';
        
        // Generar servicios disponibles a partir de datos
        const servicios = {
            wifi: espacio.wifi || false,
            parking: espacio.parking || false,
            accesible: espacio.accesible || false
        };
        
        // Obtener URL de imagen o usar placeholder
        const imagenUrl = espacio.imagen_url || '/web/assets/images/espacios/workhub.jpg';
        
        // Generar HTML para la tarjeta
        espacioCard.innerHTML = `
            <div class="espacio-imagen-container">
                <img src="${imagenUrl}" alt="${espacio.nombre}" class="espacio-imagen">
                <div class="espacio-overlay">
                    <div class="calificacion-badge">
                        <ion-icon name="star"></ion-icon>
                        <span>${espacio.calificacion || '4.5'}</span>
                    </div>
                </div>
            </div>
    
            <ion-card-header>
                <ion-card-title>${espacio.nombre}</ion-card-title>
            </ion-card-header>
    
            <ion-card-content>
                <div class="espacio-info">
                    <p class="espacio-direccion">
                        <ion-icon name="location-outline"></ion-icon>
                        ${espacio.direccion}
                    </p>
    
                    <p class="espacio-descripcion">${espacio.descripcion || 'Espacio de trabajo profesional con todas las comodidades.'}</p>
    
                    <div class="espacio-calificacion">
                        ${generarEstrellas(espacio.calificacion || 4.5)}
                        <span class="calificacion-texto">(${espacio.calificacion || 4.5})</span>
                    </div>
    
                    <div class="espacio-detalles">
                        <div class="detalle-item">
                            <ion-icon name="cash-outline"></ion-icon>
                            <span>${espacio.precio_hora}€/hora</span>
                        </div>
                        <div class="detalle-item">
                            <ion-icon name="people-outline"></ion-icon>
                            <span>Hasta ${espacio.capacidad} personas</span>
                        </div>
                    </div>
    
                    <div class="espacio-servicios">
                        ${servicios.wifi ? `
                            <ion-chip color="primary" outline>
                                <ion-icon name="wifi-outline"></ion-icon>
                                <ion-label>WiFi</ion-label>
                            </ion-chip>
                        ` : ''}
                        ${servicios.parking ? `
                            <ion-chip color="primary" outline>
                                <ion-icon name="car-outline"></ion-icon>
                                <ion-label>Parking</ion-label>
                            </ion-chip>
                        ` : ''}
                        ${servicios.accesible ? `
                            <ion-chip color="primary" outline>
                                <ion-icon name="accessibility-outline"></ion-icon>
                                <ion-label>Accesible</ion-label>
                            </ion-chip>
                        ` : ''}
                    </div>
    
                    <ion-button expand="block" class="reservar-btn" data-id="${espacio.id_espacio}">
                        <ion-icon name="calendar-outline" slot="start"></ion-icon>
                        Reservar este espacio
                    </ion-button>
                </div>
            </ion-card-content>
        `;
        
        // Agregar eventos a los elementos
        // 1. Título clickeable para ver detalles
        const cardTitle = espacioCard.querySelector('ion-card-title');
        if (cardTitle) {
            cardTitle.addEventListener('click', () => verDetallesEspacio(espacio.id_espacio));
        }
        
        // 2. Botón de reserva
        const reservarBtn = espacioCard.querySelector(`.reservar-btn[data-id="${espacio.id_espacio}"]`);
        if (reservarBtn) {
            reservarBtn.addEventListener('click', () => nuevaReserva(espacio.id_espacio));
        }
        
        return espacioCard;
    }
    
    /**
     * Expande o colapsa una ubicación
     */
    function toggleUbicacion(ubicacion, ubicacionSection) {
        ubicacion.expandido = !ubicacion.expandido;
        
        // Actualizar el icono
        const expandIcon = ubicacionSection.querySelector('.expand-icon');
        if (expandIcon) {
            expandIcon.name = ubicacion.expandido ? 'chevron-up-outline' : 'chevron-down-outline';
        }
        
        // Mostrar/ocultar la lista de espacios
        const espaciosList = ubicacionSection.querySelector('.espacios-list');
        if (espaciosList) {
            espaciosList.style.display = ubicacion.expandido ? 'grid' : 'none';
        }
    }
    
    /**
     * Ver detalles de un espacio
     */
    function verDetallesEspacio(espacioId) {
        console.log('Ver detalles del espacio:', espacioId);
        mostrarToast(`Viendo detalles del espacio ${espacioId}`, 'primary');
        // Implementación futura: redirigir a la página de detalles
        // window.location.href = `/web/menus/espacio-detalle.html?id=${espacioId}`;
    }
    
    /**
     * Iniciar una nueva reserva
     */
    function nuevaReserva(espacioId) {
        console.log('Nueva reserva para el espacio:', espacioId);
        // Redireccionar a la página de reserva con el ID del espacio
        window.location.href = `/web/menus/reservar.html?espacio=${espacioId}`;
    }
    
    /**
     * Genera HTML de estrellas según calificación
     */
    function generarEstrellas(calificacion) {
        const totalEstrellas = 5;
        const estrellas = [];
        
        // Redondear a medio punto más cercano
        const calificacionRedondeada = Math.round(calificacion * 2) / 2;
        
        for (let i = 0; i < totalEstrellas; i++) {
            if (i < Math.floor(calificacionRedondeada)) {
                // Estrella completa
                estrellas.push('<ion-icon name="star" class="star-icon"></ion-icon>');
            } else if (i < calificacionRedondeada) {
                // Media estrella
                estrellas.push('<ion-icon name="star-half-outline" class="star-icon"></ion-icon>');
            } else {
                // Sin estrella
                estrellas.push('<ion-icon name="star-outline" class="star-icon"></ion-icon>');
            }
        }
        
        return estrellas.join('');
    }
    
    /**
     * Funciones de UI para indicadores de carga y errores
     */
    function mostrarCargando() {
        // Crear y mostrar indicador de carga
        const cargando = document.createElement('div');
        cargando.id = 'indicador-carga';
        cargando.innerHTML = `
            <div class="cargando-contenedor">
                <ion-spinner name="crescent"></ion-spinner>
                <p>Cargando espacios...</p>
            </div>
        `;
        cargando.style.position = 'fixed';
        cargando.style.top = '0';
        cargando.style.left = '0';
        cargando.style.width = '100%';
        cargando.style.height = '100%';
        cargando.style.backgroundColor = 'rgba(0,0,0,0.4)';
        cargando.style.display = 'flex';
        cargando.style.justifyContent = 'center';
        cargando.style.alignItems = 'center';
        cargando.style.zIndex = '9999';
        
        document.body.appendChild(cargando);
    }
    
    function ocultarCargando() {
        // Eliminar indicador de carga
        const cargando = document.getElementById('indicador-carga');
        if (cargando) {
            cargando.remove();
        }
    }
    
    function mostrarError(mensaje) {
        // Mostrar mensaje de error en un toast
        mostrarToast(mensaje, 'danger', 5000);
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