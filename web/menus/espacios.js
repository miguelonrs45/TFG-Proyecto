document.addEventListener('DOMContentLoaded', () => {
    // Datos de espacios (simulación de backend)
    const ubicaciones = [
      {
        ciudad: 'Murcia',
        expandido: true,
        espacios: [
          {
            id: 1,
            nombre: 'Coworking Central Murcia',
            direccion: 'Calle Mayor, 15, 30001 Murcia',
            descripcion: 'Espacio moderno con luz natural y todas las comodidades para trabajar en el centro de Murcia.',
            imagen: '/web/assets/images/espacios/workhub.jpg',
            calificacion: 4.5,
            precio_hora: 15,
            capacidad: 20,
            disponible: true,
            servicios: {
              wifi: true,
              parking: true,
              accesible: true
            }
          },
          {
            id: 2,
            nombre: 'Oficinas Premium La Flota',
            direccion: 'Avda. Juan Carlos I, 45, 30100 Murcia',
            descripcion: 'Espacios ejecutivos en la zona empresarial de La Flota. Ambiente profesional y tranquilo.',
            imagen: '/web/assets/images/espacios/office-connect.jpg',
            calificacion: 4.2,
            precio_hora: 20,
            capacidad: 8,
            disponible: true,
            servicios: {
              wifi: true,
              parking: true,
              accesible: false
            }
          },
          {
            id: 3,
            nombre: 'Innovation Hub Murcia',
            direccion: 'Plaza Circular, 5, 30008 Murcia',
            descripcion: 'Espacio colaborativo orientado a startups y proyectos innovadores.',
            imagen: '/web/assets/images/espacios/urban.jpg',
            calificacion: 4.8,
            precio_hora: 12,
            capacidad: 30,
            disponible: true,
            servicios: {
              wifi: true,
              parking: false,
              accesible: true
            }
          }
        ]
      },
      {
        ciudad: 'Cartagena',
        expandido: false,
        espacios: [
          {
            id: 4,
            nombre: 'Puerto Cowork',
            direccion: 'Paseo Alfonso XII, 20, 30202 Cartagena',
            descripcion: 'Espacio de trabajo con vistas al puerto. Ambiente marino y creativo.',
            imagen: '/web/assets/images/espacios/digital.jpg',
            calificacion: 4.6,
            precio_hora: 18,
            capacidad: 15,
            disponible: true,
            servicios: {
              wifi: true,
              parking: true,
              accesible: true
            }
          },
          {
            id: 5,
            nombre: 'Histórico Business Center',
            direccion: 'Calle Mayor, 8, 30201 Cartagena',
            descripcion: 'Oficinas en edificio histórico rehabilitado en el centro de Cartagena.',
            imagen: '/web/assets/images/espacios/workhub.jpg',
            calificacion: 4.0,
            precio_hora: 22,
            capacidad: 10,
            disponible: true,
            servicios: {
              wifi: true,
              parking: false,
              accesible: false
            }
          }
        ]
      },
      {
        ciudad: 'Lorca',
        expandido: false,
        espacios: [
          {
            id: 6,
            nombre: 'CreativeSpace Lorca',
            direccion: 'Alameda de Cervantes, 12, 30800 Lorca',
            descripcion: 'Espacio para profesionales creativos con zonas de reunión y networking.',
            imagen: '/web/assets/images/espacios/urban.jpg',
            calificacion: 4.3,
            precio_hora: 10,
            capacidad: 25,
            disponible: true,
            servicios: {
              wifi: true,
              parking: true,
              accesible: true
            }
          }
        ]
      }
    ];
  
    // Referencias a elementos DOM
    const ubicacionesContainer = document.getElementById('ubicaciones-container');
    const noEspaciosElement = document.getElementById('no-espacios');
  
    // Comprobar si hay espacios disponibles
    if (ubicaciones.length === 0) {
      noEspaciosElement.style.display = 'flex';
    } else {
      renderizarUbicaciones(ubicaciones);
    }
  
    // Función principal para renderizar las ubicaciones
    function renderizarUbicaciones(ubicaciones) {
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
  
    // Función para crear una tarjeta de espacio
    function crearTarjetaEspacio(espacio) {
      const espacioCard = document.createElement('ion-card');
      espacioCard.className = 'espacio-card';
  
      // Generar HTML para la tarjeta
      espacioCard.innerHTML = `
        <div class="espacio-imagen-container">
          <img src="${espacio.imagen}" alt="${espacio.nombre}" class="espacio-imagen">
          <div class="espacio-overlay">
            <div class="calificacion-badge">
              <ion-icon name="star"></ion-icon>
              <span>${espacio.calificacion}</span>
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
  
            <p class="espacio-descripcion">${espacio.descripcion}</p>
  
            <div class="espacio-calificacion">
              ${generarEstrellas(espacio.calificacion)}
              <span class="calificacion-texto">(${espacio.calificacion})</span>
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
              ${espacio.servicios.wifi ? `
                <ion-chip color="primary" outline>
                  <ion-icon name="wifi-outline"></ion-icon>
                  <ion-label>WiFi</ion-label>
                </ion-chip>
              ` : ''}
              ${espacio.servicios.parking ? `
                <ion-chip color="primary" outline>
                  <ion-icon name="car-outline"></ion-icon>
                  <ion-label>Parking</ion-label>
                </ion-chip>
              ` : ''}
              ${espacio.servicios.accesible ? `
                <ion-chip color="primary" outline>
                  <ion-icon name="accessibility-outline"></ion-icon>
                  <ion-label>Accesible</ion-label>
                </ion-chip>
              ` : ''}
            </div>
  
            <ion-button expand="block" class="reservar-btn" id="reservar-${espacio.id}">
              <ion-icon name="calendar-outline" slot="start"></ion-icon>
              Reservar este espacio
            </ion-button>
          </div>
        </ion-card-content>
      `;
  
      // Agregar eventos a los elementos
      // 1. Título clickeable para ver detalles
      const cardTitle = espacioCard.querySelector('ion-card-title');
      cardTitle.addEventListener('click', () => verDetallesEspacio(espacio.id));
      
      // 2. Botón de reserva
      const reservarBtn = espacioCard.querySelector(`#reservar-${espacio.id}`);
      reservarBtn.addEventListener('click', () => nuevaReserva(espacio.id));
  
      return espacioCard;
    }
  
    // Función para generar HTML de estrellas según calificación
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
  
    // Función para expandir/colapsar una ubicación
    function toggleUbicacion(ubicacion, ubicacionSection) {
      ubicacion.expandido = !ubicacion.expandido;
      
      // Actualizar el icono
      const expandIcon = ubicacionSection.querySelector('.expand-icon');
      expandIcon.name = ubicacion.expandido ? 'chevron-up-outline' : 'chevron-down-outline';
      
      // Mostrar/ocultar la lista de espacios
      const espaciosList = ubicacionSection.querySelector('.espacios-list');
      if (ubicacion.expandido) {
        espaciosList.style.display = 'grid';
      } else {
        espaciosList.style.display = 'none';
      }
    }
  
    // Función para ver detalles de un espacio
    function verDetallesEspacio(espacioId) {
      console.log('Ver detalles del espacio:', espacioId);
      // Implementación: redirigir a la página de detalles
      // window.location.href = `/web/menus/espacio-detalle.html?id=${espacioId}`;
      
      // Mostrar mensaje temporal
      mostrarToast(`Ver detalles del espacio ${espacioId}`, 'information');
    }
  
    // Función para iniciar una nueva reserva
    function nuevaReserva(espacioId) {
      console.log('Nueva reserva para el espacio:', espacioId);
      // Implementación: redirigir a la página de reserva
      window.location.href = `/web/menus/reservar.html?espacio=${espacioId}`;
    }
  
    // Función para mostrar mensajes Toast
    function mostrarToast(mensaje, color = 'primary', duracion = 2000) {
      const toast = document.createElement('ion-toast');
      toast.message = mensaje;
      toast.duration = duracion;
      toast.position = 'top';
      toast.color = color;
      
      document.body.appendChild(toast);
      toast.present();
    }
  });