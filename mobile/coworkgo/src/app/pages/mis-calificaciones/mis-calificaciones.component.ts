import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonInput, IonSelect,
  IonSelectOption, IonList, IonItem, IonLabel, IonBackButton, IonButtons,
  IonSearchbar, IonChip, IonImg, IonBadge, IonItemSliding, IonItemOptions,
  IonItemOption, IonRefresher, IonRefresherContent, IonThumbnail,
  IonSegment, IonSegmentButton, AlertController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  starOutline, star, createOutline, trashOutline,
  filterOutline, optionsOutline, arrowDownOutline,
  arrowUpOutline, eyeOutline, eyeOffOutline, closeCircle
} from 'ionicons/icons';

interface Resena {
  id: number;
  espacioId: number;
  espacioNombre: string;
  espacioImagen: string;
  calificacion: number;
  comentario: string;
  fechaVisita: Date;
  fechaResena: Date;
  esPublica: boolean;
}

interface ResumenEstadisticas {
  totalResenas: number;
  calificacionMedia: number;
  mejorValorado: {
    nombre: string;
    calificacion: number;
    id: number;
  } | null;
}

@Component({
  selector: 'app-mis-calificaciones',
  templateUrl: './mis-calificaciones.component.html',
  styleUrls: ['./mis-calificaciones.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonInput,
    IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonBackButton,
    IonButtons, IonSearchbar, IonChip, IonImg, IonBadge, IonItemSliding,
    IonItemOptions, IonItemOption, IonRefresher, IonRefresherContent,
    IonThumbnail, IonSegment, IonSegmentButton
  ]
})
export class MisCalificacionesComponent implements OnInit {
  resenas: Resena[] = [];
  resenasFiltradas: Resena[] = [];
  resenasPendientes: any[] = [];
  estadisticas: ResumenEstadisticas = {
    totalResenas: 0,
    calificacionMedia: 0,
    mejorValorado: null
  };

  filtroTexto: string = '';
  ordenActual: string = 'fecha-reciente';
  filtroActual: string = 'todas';

  // Nueva propiedad para los valores temporales durante la edición
  resenaEnEdicion: Resena | null = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      starOutline, star, createOutline, trashOutline,
      filterOutline, optionsOutline, arrowDownOutline,
      arrowUpOutline, eyeOutline, eyeOffOutline, closeCircle
    });
  }

  ngOnInit() {
    this.cargarResenas();
    this.cargarResenasPendientes();
  }

  cargarResenas() {
    // Aquí conectaríamos con el servicio para cargar las reseñas del usuario actual
    this.resenas = [
      {
        id: 1,
        espacioId: 1,
        espacioNombre: 'WorkHub Central',
        espacioImagen: 'assets/images/espacios/workhub.jpg',
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
        espacioImagen: 'assets/images/espacios/office-connect.jpg',
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
        espacioImagen: 'assets/images/espacios/urban.jpg',
        calificacion: 3,
        comentario: 'Espacio adecuado pero ruidoso. La conexión WiFi es inestable. Podría mejorar la iluminación en algunas zonas.',
        fechaVisita: new Date(2025, 1, 10),
        fechaResena: new Date(2025, 1, 11),
        esPublica: false
      }
    ];

    this.resenasFiltradas = [...this.resenas];
    this.calcularEstadisticas();
    this.aplicarFiltros();
  }

  cargarResenasPendientes() {
    // Simulación de reseñas pendientes (espacios visitados pero sin calificar)
    this.resenasPendientes = [
      {
        id: 4,
        nombre: 'Digital Workspace',
        fechaVisita: new Date(2025, 4, 5),
        imagen: 'assets/images/espacios/digital.jpg'
      }
    ];
  }

  calcularEstadisticas() {
    if (this.resenas.length === 0) {
      this.estadisticas = {
        totalResenas: 0,
        calificacionMedia: 0,
        mejorValorado: null
      };
      return;
    }

    // Calcular total
    this.estadisticas.totalResenas = this.resenas.length;

    // Calcular promedio
    const sumaCalificaciones = this.resenas.reduce((acc, resena) => acc + resena.calificacion, 0);
    this.estadisticas.calificacionMedia = sumaCalificaciones / this.resenas.length;

    // Encontrar mejor valorado
    const mejorResena = [...this.resenas].sort((a, b) => b.calificacion - a.calificacion)[0];
    this.estadisticas.mejorValorado = {
      nombre: mejorResena.espacioNombre,
      calificacion: mejorResena.calificacion,
      id: mejorResena.espacioId
    };
  }

  aplicarFiltros() {
    let resenasFiltradas = [...this.resenas];

    // Aplicar filtro de texto
    if (this.filtroTexto.trim() !== '') {
      const texto = this.filtroTexto.toLowerCase();
      resenasFiltradas = resenasFiltradas.filter(
        resena => resena.espacioNombre.toLowerCase().includes(texto) ||
                  resena.comentario.toLowerCase().includes(texto)
      );
    }

    // Aplicar filtro de visibilidad
    switch(this.filtroActual) {
      case 'publicas':
        resenasFiltradas = resenasFiltradas.filter(resena => resena.esPublica);
        break;
      case 'privadas':
        resenasFiltradas = resenasFiltradas.filter(resena => !resena.esPublica);
        break;
      // Por defecto, caso 'todas': no se aplica filtro
    }

    // Aplicar ordenación
    switch(this.ordenActual) {
      case 'fecha-reciente':
        resenasFiltradas.sort((a, b) => b.fechaResena.getTime() - a.fechaResena.getTime());
        break;
      case 'fecha-antigua':
        resenasFiltradas.sort((a, b) => a.fechaResena.getTime() - b.fechaResena.getTime());
        break;
      case 'calificacion-alta':
        resenasFiltradas.sort((a, b) => b.calificacion - a.calificacion);
        break;
      case 'calificacion-baja':
        resenasFiltradas.sort((a, b) => a.calificacion - b.calificacion);
        break;
      case 'nombre-az':
        resenasFiltradas.sort((a, b) => a.espacioNombre.localeCompare(b.espacioNombre));
        break;
      case 'nombre-za':
        resenasFiltradas.sort((a, b) => b.espacioNombre.localeCompare(a.espacioNombre));
        break;
    }

    this.resenasFiltradas = resenasFiltradas;
  }

  buscar(event: any) {
    this.filtroTexto = event.detail.value;
    this.aplicarFiltros();
  }

  cambiarOrden(orden: string) {
    this.ordenActual = orden;
    this.aplicarFiltros();
  }

  calificarPendiente(espacioId: number) {
    // Aquí navegaríamos a la pantalla de calificación para el espacio específico
    console.log('Calificar espacio pendiente:', espacioId);
  }

  async editarResena(resena: Resena) {
    // Creamos una copia para no modificar el original hasta confirmar los cambios
    this.resenaEnEdicion = { ...resena };

    // Variable para almacenar la calificación actual durante la edición
    let calificacionActual = resena.calificacion;

    // Creamos un componente HTML personalizado con estrellas
    const customHtml = `
      <div class="rating-stars-container">
        <p class="rating-title">Selecciona tu calificación:</p>
        <div class="rating-stars">
          <div class="star-wrapper">
            <ion-icon class="star-icon" data-value="1" name="${calificacionActual >= 1 ? 'star' : 'star-outline'}"></ion-icon>
          </div>
          <div class="star-wrapper">
            <ion-icon class="star-icon" data-value="2" name="${calificacionActual >= 2 ? 'star' : 'star-outline'}"></ion-icon>
          </div>
          <div class="star-wrapper">
            <ion-icon class="star-icon" data-value="3" name="${calificacionActual >= 3 ? 'star' : 'star-outline'}"></ion-icon>
          </div>
          <div class="star-wrapper">
            <ion-icon class="star-icon" data-value="4" name="${calificacionActual >= 4 ? 'star' : 'star-outline'}"></ion-icon>
          </div>
          <div class="star-wrapper">
            <ion-icon class="star-icon" data-value="5" name="${calificacionActual >= 5 ? 'star' : 'star-outline'}"></ion-icon>
          </div>
        </div>
        <p class="rating-value">${calificacionActual} de 5 estrellas</p>
      </div>
    `;

    const alert = await this.alertController.create({
      header: 'Editar Reseña',
      subHeader: resena.espacioNombre,
      cssClass: 'custom-alert-resena',
      backdropDismiss: false,
      inputs: [
        {
          name: 'calificacionHidden',
          type: 'hidden' as 'radio', // Truco TypeScript para usar un tipo válido
          value: calificacionActual.toString()
        },
        {
          name: 'comentario',
          type: 'textarea',
          value: resena.comentario,
          placeholder: 'Describe tu experiencia con este espacio...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button',
          handler: () => {
            this.resenaEnEdicion = null;
          }
        },
        {
          text: 'Guardar Cambios',
          cssClass: 'save-button',
          handler: (data) => {
            // Obtenemos la calificación del campo oculto
            const inputElement = document.querySelector('input[name="calificacionHidden"]') as HTMLInputElement;
            let calificacion = calificacionActual.toString();

            if (inputElement) {
              calificacion = inputElement.value;
            }

            // Validaciones
            if (!calificacion || parseInt(calificacion) < 1 || parseInt(calificacion) > 5) {
              this.mostrarMensaje('Por favor, selecciona una calificación válida', 'danger');
              return false;
            }

            if (!data.comentario || data.comentario.trim() === '') {
              this.mostrarMensaje('Por favor, ingresa un comentario', 'danger');
              return false;
            }

            // Guardar los cambios
            const index = this.resenas.findIndex(r => r.id === resena.id);
            if (index !== -1) {
              this.resenas[index].calificacion = parseInt(calificacion);
              this.resenas[index].comentario = data.comentario;
              this.resenas[index].fechaResena = new Date();

              // Actualizar las reseñas filtradas
              this.aplicarFiltros();
              this.calcularEstadisticas();

              // Confirmar al usuario
              this.mostrarMensaje('Reseña actualizada con éxito', 'success');
            }

            this.resenaEnEdicion = null;
            return true;
          }
        }
      ]
    });

    await alert.present();

    // MODIFICADO PARA ASEGURAR QUE LAS ESTRELLAS APAREZCAN DEBAJO DEL TEXTAREA
    setTimeout(() => {
      console.log('Reestructurando el diálogo para poner estrellas debajo del texto...');

      // Obtener la alerta
      const alertElement = document.querySelector('.custom-alert-resena');
      if (alertElement) {
        // Intentamos encontrar el contenedor de botones
        const buttonGroup = alertElement.querySelector('.alert-button-group');

        // Intentamos encontrar el contenedor de entrada o el textarea
        const inputWrapper = alertElement.querySelector('.alert-input-wrapper');

        if (inputWrapper && buttonGroup) {
          console.log('Encontrados elementos necesarios para reestructurar');

          // Crear un contenedor para nuestras estrellas
          const starsContainer = document.createElement('div');
          starsContainer.className = 'stars-custom-container';
          starsContainer.innerHTML = customHtml;

          // Insertar el contenedor de estrellas entre el contenedor de input y los botones
          buttonGroup.parentNode?.insertBefore(starsContainer, buttonGroup);

          // Añadimos comportamiento interactivo a las estrellas
          const stars = document.querySelectorAll('.rating-stars .star-icon');
          const ratingValue = document.querySelector('.rating-value');
          const hiddenInput = document.querySelector('input[name="calificacionHidden"]') as HTMLInputElement;

          stars.forEach(star => {
            // Para clicks y toques
            ['click', 'touchstart'].forEach(eventName => {
              star.addEventListener(eventName, (event) => {
                // Prevenir comportamiento por defecto para evitar problemas en móviles
                event.preventDefault();

                // Asegurarnos de que event.currentTarget es un Element
                const target = event.currentTarget as Element;

                // Ahora podemos acceder con seguridad a getAttribute
                const dataValue = target.getAttribute('data-value');
                if (dataValue) {
                  const value = parseInt(dataValue);
                  calificacionActual = value;

                  if (hiddenInput) {
                    hiddenInput.value = value.toString();
                  }

                  // Actualizar la visualización de las estrellas
                  stars.forEach(s => {
                    const starElement = s as Element;
                    const starValue = starElement.getAttribute('data-value');
                    if (starValue && parseInt(starValue) <= value) {
                      starElement.setAttribute('name', 'star');
                    } else {
                      starElement.setAttribute('name', 'star-outline');
                    }
                  });

                  // Actualizar el texto
                  if (ratingValue) {
                    ratingValue.textContent = `${value} de 5 estrellas`;
                  }
                }
              });
            });

            // También añadimos efecto visual al pasar el ratón
            star.addEventListener('mouseenter', (event) => {
              const target = event.currentTarget as Element;
              const hoverValue = target.getAttribute('data-value');

              if (hoverValue) {
                // Mostrar visual hover
                stars.forEach(s => {
                  const starElement = s as Element;
                  const starValue = starElement.getAttribute('data-value');
                  if (starValue && parseInt(starValue) <= parseInt(hoverValue)) {
                    starElement.classList.add('star-hover');
                  }
                });
              }
            });

            star.addEventListener('mouseleave', () => {
              // Quitar visual hover
              stars.forEach(s => {
                const starElement = s as Element;
                starElement.classList.remove('star-hover');
              });
            });
          });
        } else {
          console.log('No se encontraron los elementos necesarios para reestructurar');
        }
      } else {
        console.log('No se pudo encontrar la alerta con la clase custom-alert-resena');
      }
    }, );
  }

  // Método auxiliar para generar el HTML de las estrellas
  private generarEstrellas(calificacion: number): string {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= calificacion) {
        starsHtml += '<ion-icon name="star" class="star-filled"></ion-icon>';
      } else {
        starsHtml += '<ion-icon name="star-outline" class="star-outline"></ion-icon>';
      }
    }
    return starsHtml;
  }
  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  async eliminarResena(resena: Resena) {
    // Aquí mostraríamos un diálogo de confirmación y se eliminaría la reseña
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta reseña?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Eliminar',
          handler: () => {
            // Simular eliminación
            this.resenas = this.resenas.filter(r => r.id !== resena.id);
            this.aplicarFiltros();
            this.calcularEstadisticas();
            this.mostrarMensaje('Reseña eliminada con éxito', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  cambiarVisibilidad(resena: Resena) {
    resena.esPublica = !resena.esPublica;
    // Aquí actualizaríamos en el backend
    console.log('Cambiar visibilidad de reseña:', resena.id, 'a', resena.esPublica ? 'pública' : 'privada');

    // Mostrar confirmación
    this.mostrarMensaje(
      `Reseña ahora es ${resena.esPublica ? 'pública' : 'privada'}`,
      'success'
    );
  }

  verDetallesEspacio(espacioId: number) {
    // Navegar a la página de detalles del espacio
    console.log('Ver detalles del espacio:', espacioId);
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.cargarResenas();
      this.cargarResenasPendientes();
      event.target.complete();
    }, 1000);
  }

  // Método para generar un array de n elementos para las estrellas
  estrellas(calificacion: number): number[] {
    return Array(5).fill(0).map((_, i) => i < calificacion ? 1 : 0);
  }
}
