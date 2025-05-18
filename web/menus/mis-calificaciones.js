// Inicialización y verificación de servicios - Agregar al principio del archivo
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Verificando servicios para calificaciones...");
    
    // Verificar autenticación
    if (!window.supabaseService) {
        console.error("Servicio Supabase no disponible");
        mostrarAlerta("Error al cargar servicios necesarios", "danger");
        return;
    }
    
    // Verificar si el usuario está autenticado
    const estaAutenticado = await window.supabaseService.verificarSesion();
    if (!estaAutenticado) {
        window.location.href = '/web/login_registro/iniciosesion.html';
        return;
    }
    
    // Función para mostrar alertas si no existe
    async function mostrarAlerta(mensaje, color = 'primary', duracion = 3000) {
        const toast = document.createElement('ion-toast');
        toast.message = mensaje;
        toast.duration = duracion;
        toast.position = 'top';
        toast.color = color;
        document.body.appendChild(toast);
        await toast.present();
    }
    
    // El resto del código del archivo se mantiene igual
});

document.addEventListener('DOMContentLoaded', () => {
    // Data models
    let resenas = [];
    let resenasFiltradas = [];
    let resenasPendientes = [];
    let estadisticas = {
      totalResenas: 0,
      calificacionMedia: 0,
      mejorValorado: null
    };
  
    // Elementos DOM
    const filterSegment = document.getElementById('filter-segment');
    const orderSelect = document.getElementById('order-select');
    const searchbar = document.getElementById('searchbar');
    const refresher = document.getElementById('refresher');
    const resetFiltersButton = document.getElementById('reset-filters');
    const resenasContainer = document.getElementById('resenas-container');
    const emptyState = document.getElementById('empty-state');
    const pendingReviewsContainer = document.getElementById('pending-reviews-container');
    const pendingList = document.getElementById('pending-list');
    const pendingCount = document.getElementById('pending-count');
  
    // Estadísticas
    const statsTotal = document.getElementById('stats-total');
    const statsMedia = document.getElementById('stats-media');
    const statsMejor = document.getElementById('stats-mejor');
    const statsMejorContainer = document.getElementById('stats-mejor-container');
  
    // Variables para filtros y ordenación
    let filtroTexto = '';
    let ordenActual = 'fecha-reciente';
    let filtroActual = 'todas';
  
    // Inicialización
    cargarDatos();
    setupEventListeners();
  
    // Función para cargar datos
    function cargarDatos() {
      cargarResenas();
      cargarResenasPendientes();
      aplicarFiltros();
      actualizarEstadisticas();
      actualizarUI();
    }
  
    // Carga de datos de reseñas (simulado)
    function cargarResenas() {
      // En una implementación real, esto cargaría datos desde una API o localStorage
      resenas = [
        {
          id: 1,
          espacioId: 1,
          espacioNombre: 'WorkHub Central',
          espacioImagen: '/web/assets/images/espacios/workhub.jpg',
          calificacion: 4,
          comentario: 'Excelente espacio de trabajo, muy cómodo y bien equipado. Buena conexión WiFi.',
          fechaVisita: new Date(2025, 3, 15),
          fechaResena: new Date(2025, 3, 16),
          esPublica: true
        },
        {
          id: 2,
          espacioId: 2,
          espacioNombre: 'Office Connect',
          espacioImagen: '/web/assets/images/espacios/office-connect.jpg',
          calificacion: 5,
          comentario: 'El mejor espacio que he utilizado. Personal amable y todas las comodidades necesarias.',
          fechaVisita: new Date(2025, 2, 20),
          fechaResena: new Date(2025, 2, 22),
          esPublica: true
        },
        {
          id: 3,
          espacioId: 3,
          espacioNombre: 'Urban Cowork',
          espacioImagen: '/web/assets/images/espacios/urban.jpg',
          calificacion: 3,
          comentario: 'Espacio adecuado pero ruidoso. La conexión WiFi es inestable. Podría mejorar la iluminación en algunas zonas.',
          fechaVisita: new Date(2025, 1, 10),
          fechaResena: new Date(2025, 1, 11),
          esPublica: false
        }
      ];
  
      resenasFiltradas = [...resenas];
    }
  
    // Carga de reseñas pendientes (simulado)
    function cargarResenasPendientes() {
      resenasPendientes = [
        {
          id: 4,
          nombre: 'Digital Workspace',
          fechaVisita: new Date(2025, 4, 5),
          imagen: '/web/assets/images/espacios/digital.jpg'
        }
      ];
    }
  
    // Configurar event listeners
    function setupEventListeners() {
      // Listener para el segmento de filtros
      filterSegment.addEventListener('ionChange', (event) => {
        filtroActual = event.detail.value;
        aplicarFiltros();
      });
  
      // Listener para el select de ordenación
      orderSelect.addEventListener('ionChange', (event) => {
        ordenActual = event.detail.value;
        aplicarFiltros();
      });
  
      // Listener para la búsqueda
      searchbar.addEventListener('ionChange', (event) => {
        filtroTexto = event.detail.value || '';
        aplicarFiltros();
      });
  
      // Listener para el refresher
      refresher.addEventListener('ionRefresh', (event) => {
        setTimeout(() => {
          cargarDatos();
          event.target.complete();
        }, 1000);
      });
  
      // Listener para el botón de reseteo de filtros
      resetFiltersButton.addEventListener('click', () => {
        // Resetear filtros
        filtroTexto = '';
        filtroActual = 'todas';
        ordenActual = 'fecha-reciente';
        
        // Resetear UI
        searchbar.value = '';
        filterSegment.value = 'todas';
        orderSelect.value = 'fecha-reciente';
        
        // Aplicar filtros reseteados
        aplicarFiltros();
      });
  
      // Listener para el contenedor de estadísticas
      statsMejorContainer.addEventListener('click', () => {
        if (estadisticas.mejorValorado) {
          verDetallesEspacio(estadisticas.mejorValorado.id);
        }
      });
    }
  
    // Aplicar filtros y ordenación
    function aplicarFiltros() {
      let resenasAFiltrar = [...resenas];
  
      // Aplicar filtro de texto
      if (filtroTexto.trim() !== '') {
        const texto = filtroTexto.toLowerCase();
        resenasAFiltrar = resenasAFiltrar.filter(
          resena => resena.espacioNombre.toLowerCase().includes(texto) ||
                   resena.comentario.toLowerCase().includes(texto)
        );
      }
  
      // Aplicar filtro de visibilidad
      switch(filtroActual) {
        case 'publicas':
          resenasAFiltrar = resenasAFiltrar.filter(resena => resena.esPublica);
          break;
        case 'privadas':
          resenasAFiltrar = resenasAFiltrar.filter(resena => !resena.esPublica);
          break;
        // Por defecto, caso 'todas': no se aplica filtro
      }
  
      // Aplicar ordenación
      switch(ordenActual) {
        case 'fecha-reciente':
          resenasAFiltrar.sort((a, b) => b.fechaResena.getTime() - a.fechaResena.getTime());
          break;
        case 'fecha-antigua':
          resenasAFiltrar.sort((a, b) => a.fechaResena.getTime() - b.fechaResena.getTime());
          break;
        case 'calificacion-alta':
          resenasAFiltrar.sort((a, b) => b.calificacion - a.calificacion);
          break;
        case 'calificacion-baja':
          resenasAFiltrar.sort((a, b) => a.calificacion - b.calificacion);
          break;
        case 'nombre-az':
          resenasAFiltrar.sort((a, b) => a.espacioNombre.localeCompare(b.espacioNombre));
          break;
        case 'nombre-za':
          resenasAFiltrar.sort((a, b) => b.espacioNombre.localeCompare(a.espacioNombre));
          break;
      }
  
      resenasFiltradas = resenasAFiltrar;
      actualizarUI();
    }
  
    // Calcular estadísticas
    function actualizarEstadisticas() {
      if (resenas.length === 0) {
        estadisticas = {
          totalResenas: 0,
          calificacionMedia: 0,
          mejorValorado: null
        };
        return;
      }
  
      // Calcular total
      estadisticas.totalResenas = resenas.length;
  
      // Calcular promedio
      const sumaCalificaciones = resenas.reduce((acc, resena) => acc + resena.calificacion, 0);
      estadisticas.calificacionMedia = sumaCalificaciones / resenas.length;
  
      // Encontrar mejor valorado
      const mejorResena = [...resenas].sort((a, b) => b.calificacion - a.calificacion)[0];
      estadisticas.mejorValorado = {
        nombre: mejorResena.espacioNombre,
        calificacion: mejorResena.calificacion,
        id: mejorResena.espacioId
      };
    }
  
    // Actualizar la interfaz de usuario
    function actualizarUI() {
      // Actualizar estadísticas
      statsTotal.textContent = estadisticas.totalResenas;
      statsMedia.textContent = estadisticas.calificacionMedia.toFixed(1);
      
      if (estadisticas.mejorValorado) {
        statsMejor.textContent = estadisticas.mejorValorado.nombre;
        statsMejorContainer.style.display = 'flex';
      } else {
        statsMejorContainer.style.display = 'none';
      }
  
      // Actualizar UI de reseñas pendientes
      if (resenasPendientes.length > 0) {
        pendingReviewsContainer.style.display = 'block';
        pendingCount.textContent = resenasPendientes.length;
        actualizarListaPendientes();
      } else {
        pendingReviewsContainer.style.display = 'none';
      }
  
      // Actualizar UI de reseñas filtradas
      if (resenasFiltradas.length > 0) {
        emptyState.style.display = 'none';
        resenasContainer.style.display = 'flex';
        actualizarListaResenas();
      } else {
        emptyState.style.display = 'flex';
        resenasContainer.style.display = 'none';
      }
    }
  
    // Actualizar la lista de reseñas pendientes
    function actualizarListaPendientes() {
      pendingList.innerHTML = '';
      
      resenasPendientes.forEach(pendiente => {
        const item = document.createElement('ion-item');
        
        item.innerHTML = `
          <ion-thumbnail slot="start">
            <img src="${pendiente.imagen}" alt="Imagen del espacio">
          </ion-thumbnail>
          <ion-label>
            <h2>${pendiente.nombre}</h2>
            <p>
              <ion-icon name="calendar-outline"></ion-icon>
              Visitado: ${formatearFecha(pendiente.fechaVisita)}
            </p>
          </ion-label>
          <ion-button slot="end" class="calificar-btn" data-id="${pendiente.id}" color="secondary">
            <ion-icon name="star-outline" slot="start"></ion-icon>
            Calificar
          </ion-button>
        `;
        
        pendingList.appendChild(item);
      });
      
      // Añadir listeners a los botones
      document.querySelectorAll('.calificar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'));
          calificarPendiente(id);
        });
      });
    }
  
    // Actualizar la lista de reseñas
    function actualizarListaResenas() {
      resenasContainer.innerHTML = '';
      
      resenasFiltradas.forEach(resena => {
        const card = document.createElement('ion-card');
        card.className = 'resena-card';
        
        card.innerHTML = `
          <div class="resena-header">
            <div class="espacio-imagen">
              <img src="${resena.espacioImagen}" alt="Imagen del espacio">
            </div>
            <div class="resena-info">
              <h2 class="espacio-nombre" data-id="${resena.espacioId}">
                ${resena.espacioNombre}
              </h2>
              <div class="calificacion">
                ${generarEstrellas(resena.calificacion)}
                <span class="calificacion-texto">${resena.calificacion}/5</span>
              </div>
              <div class="fechas">
                <span class="fecha-visita">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <strong>Visita:</strong> ${formatearFecha(resena.fechaVisita)}
                </span>
                <span class="fecha-resena">
                  <ion-icon name="create-outline"></ion-icon>
                  <strong>Reseña:</strong> ${formatearFecha(resena.fechaResena)}
                </span>
              </div>
            </div>
            <div class="visibilidad-badge" data-id="${resena.id}">
              <ion-icon name="${resena.esPublica ? 'eye-outline' : 'eye-off-outline'}"></ion-icon>
              <span class="visibilidad-texto">${resena.esPublica ? 'Pública' : 'Privada'}</span>
            </div>
          </div>
          <div class="resena-contenido">
            <p>${resena.comentario}</p>
          </div>
          <div class="resena-acciones">
            <ion-button fill="clear" class="editar-btn" data-id="${resena.id}">
              <ion-icon name="create-outline" slot="start"></ion-icon>
              Editar
            </ion-button>
            <ion-button fill="clear" color="danger" class="eliminar-btn" data-id="${resena.id}">
              <ion-icon name="trash-outline" slot="start"></ion-icon>
              Eliminar
            </ion-button>
          </div>
        `;
        
        resenasContainer.appendChild(card);
      });
      
      // Añadir listeners a los elementos interactivos
      configurarListenersResenas();
    }
  
    // Configurar listeners para elementos de las reseñas
    function configurarListenersResenas() {
      // Listener para nombre del espacio
      document.querySelectorAll('.espacio-nombre').forEach(element => {
        element.addEventListener('click', () => {
          const id = parseInt(element.getAttribute('data-id'));
          verDetallesEspacio(id);
        });
      });
  
      // Listener para badge de visibilidad
      document.querySelectorAll('.visibilidad-badge').forEach(element => {
        element.addEventListener('click', () => {
          const id = parseInt(element.getAttribute('data-id'));
          cambiarVisibilidad(id);
        });
      });
  
      // Listener para botón de editar
      document.querySelectorAll('.editar-btn').forEach(element => {
        element.addEventListener('click', () => {
          const id = parseInt(element.getAttribute('data-id'));
          editarResena(id);
        });
      });
  
      // Listener para botón de eliminar
      document.querySelectorAll('.eliminar-btn').forEach(element => {
        element.addEventListener('click', () => {
          const id = parseInt(element.getAttribute('data-id'));
          eliminarResena(id);
        });
      });
    }
  
    // Funciones de acción para reseñas
    function calificarPendiente(id) {
      console.log(`Calificar espacio pendiente: ${id}`);
      mostrarToast(`Calificando espacio ID: ${id}`);
      // En una implementación real, redireccionaríamos a la página de calificación
      // window.location.href = `/web/menus/nueva-calificacion.html?espacio=${id}`;
    }
  
    async function editarResena(id) {
      const resena = resenas.find(r => r.id === id);
      if (!resena) return;
      
      let calificacionActual = resena.calificacion;
      
      // Crear un elemento personalizado para las estrellas
      const starsHTML = `
        <div class="stars-custom-container">
          <p class="rating-title">Selecciona tu calificación:</p>
          <div class="rating-stars">
            ${[1, 2, 3, 4, 5].map(val => `
              <div class="star-wrapper">
                <ion-icon class="star-icon" data-value="${val}" name="${val <= calificacionActual ? 'star' : 'star-outline'}"></ion-icon>
              </div>
            `).join('')}
          </div>
          <p class="rating-value">${calificacionActual} de 5 estrellas</p>
        </div>
      `;
      
      // Crear el alert controller
      const alertController = document.createElement('ion-alert');
      alertController.header = 'Editar Reseña';
      alertController.subHeader = resena.espacioNombre;
      alertController.cssClass = 'custom-alert-resena';
      alertController.backdropDismiss = false;
      
      // Inputs para el alert
      alertController.inputs = [
        {
          name: 'calificacionHidden',
          type: 'hidden',
          value: calificacionActual.toString()
        },
        {
          name: 'comentario',
          type: 'textarea',
          value: resena.comentario,
          placeholder: 'Describe tu experiencia con este espacio...'
        }
      ];
      
      // Botones para el alert
      alertController.buttons = [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Guardar Cambios',
          cssClass: 'save-button',
          handler: (data) => {
            // Obtener calificación del campo oculto
            const calificacion = parseInt(data.calificacionHidden || calificacionActual);
            
            // Validaciones
            if (calificacion < 1 || calificacion > 5) {
              mostrarToast('Por favor, selecciona una calificación válida', 'danger');
              return false;
            }
            
            if (!data.comentario || data.comentario.trim() === '') {
              mostrarToast('Por favor, ingresa un comentario', 'danger');
              return false;
            }
            
            // Guardar cambios
            const index = resenas.findIndex(r => r.id === id);
            if (index !== -1) {
              resenas[index].calificacion = calificacion;
              resenas[index].comentario = data.comentario;
              resenas[index].fechaResena = new Date();
              
              // Actualizar UI
              aplicarFiltros();
              actualizarEstadisticas();
              actualizarUI();
              
              mostrarToast('Reseña actualizada con éxito', 'success');
            }
            
            return true;
          }
        }
      ];
      
      // Mostrar el alert
      document.body.appendChild(alertController);
      await alertController.present();
      
      // Añadir estrellas personalizadas después de que se muestre el alert
      setTimeout(() => {
        // Añadir estrellas antes de los botones
        const alertElement = document.querySelector('.custom-alert-resena');
        if (alertElement) {
          const buttonGroup = alertElement.querySelector('.alert-button-group');
          const inputWrapper = alertElement.querySelector('.alert-input-wrapper');
          
          if (inputWrapper && buttonGroup) {
            const starsContainer = document.createElement('div');
            starsContainer.className = 'stars-custom-container';
            starsContainer.innerHTML = starsHTML;
            
            buttonGroup.parentNode.insertBefore(starsContainer, buttonGroup);
            
            // Configurar interactividad de las estrellas
            const stars = document.querySelectorAll('.star-icon');
            const ratingValue = document.querySelector('.rating-value');
            const hiddenInput = document.querySelector('input[name="calificacionHidden"]');
            
            stars.forEach(star => {
              star.addEventListener('click', (event) => {
                const value = parseInt(event.target.getAttribute('data-value'));
                calificacionActual = value;
                
                if (hiddenInput) {
                  hiddenInput.value = value.toString();
                }
                
                // Actualizar estrellas
                stars.forEach(s => {
                  const starValue = parseInt(s.getAttribute('data-value'));
                  s.setAttribute('name', starValue <= value ? 'star' : 'star-outline');
                });
                
                // Actualizar texto
                if (ratingValue) {
                  ratingValue.textContent = `${value} de 5 estrellas`;
                }
              });
              
              // Efectos visuales al pasar el ratón
              star.addEventListener('mouseenter', (event) => {
                const hoverValue = parseInt(event.target.getAttribute('data-value'));
                
                stars.forEach(s => {
                  const starValue = parseInt(s.getAttribute('data-value'));
                  if (starValue <= hoverValue) {
                    s.classList.add('star-hover');
                  }
                });
              });
              
              star.addEventListener('mouseleave', () => {
                stars.forEach(s => s.classList.remove('star-hover'));
              });
            });
          }
        }
      }, 100);
    }
  
    async function eliminarResena(id) {
      const resena = resenas.find(r => r.id === id);
      if (!resena) return;
      
      // Crear alert de confirmación
      const alertController = document.createElement('ion-alert');
      alertController.header = 'Confirmar eliminación';
      alertController.message = '¿Estás seguro de que deseas eliminar esta reseña?';
      alertController.buttons = [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            // Eliminar reseña
            resenas = resenas.filter(r => r.id !== id);
            
            // Actualizar UI
            aplicarFiltros();
            actualizarEstadisticas();
            actualizarUI();
            
            mostrarToast('Reseña eliminada con éxito', 'success');
          }
        }
      ];
      
      document.body.appendChild(alertController);
      await alertController.present();
    }
  
    function cambiarVisibilidad(id) {
      const index = resenas.findIndex(r => r.id === id);
      if (index === -1) return;
      
      // Cambiar visibilidad
      resenas[index].esPublica = !resenas[index].esPublica;
      const nuevoEstado = resenas[index].esPublica ? 'pública' : 'privada';
      
      // Actualizar UI
      aplicarFiltros();
      
      mostrarToast(`Reseña ahora es ${nuevoEstado}`, 'success');
    }
  
    function verDetallesEspacio(id) {
      console.log(`Ver detalles del espacio: ${id}`);
      mostrarToast(`Viendo detalles del espacio ID: ${id}`);
      // En una implementación real, redireccionaríamos a la página de detalles
      // window.location.href = `/web/menus/espacio-detalle.html?id=${id}`;
    }
  
    // Utilitarios
    async function mostrarToast(mensaje, color = 'primary', duracion = 2000) {
      const toast = document.createElement('ion-toast');
      toast.message = mensaje;
      toast.duration = duracion;
      toast.position = 'bottom';
      toast.color = color;
      
      document.body.appendChild(toast);
      await toast.present();
    }
  
    function formatearFecha(fecha) {
      if (!fecha) return '';
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  
    function generarEstrellas(calificacion) {
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= calificacion) {
          starsHtml += '<ion-icon name="star" color="warning"></ion-icon>';
        } else {
          starsHtml += '<ion-icon name="star-outline" color="warning"></ion-icon>';
        }
      }
      return starsHtml;
    }
  });