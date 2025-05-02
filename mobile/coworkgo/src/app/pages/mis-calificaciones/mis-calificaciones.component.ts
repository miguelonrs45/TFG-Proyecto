import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonInput, IonSelect,
  IonSelectOption, IonList, IonItem, IonLabel, IonBackButton, IonButtons,
  IonSearchbar, IonChip, IonImg, IonBadge, IonItemSliding, IonItemOptions,
  IonItemOption, IonRefresher, IonRefresherContent, IonThumbnail,
  IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
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

  constructor(private router: Router) {
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
    // Por ahora usamos datos de ejemplo
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

  editarResena(resena: Resena) {
    // Aquí navegaríamos a la pantalla de edición de reseña
    console.log('Editar reseña:', resena.id);
  }

  async eliminarResena(resena: Resena) {
    // Aquí mostraríamos un diálogo de confirmación y se eliminaría la reseña
    console.log('Eliminar reseña:', resena.id);

    // Simulación de eliminación
    this.resenas = this.resenas.filter(r => r.id !== resena.id);
    this.aplicarFiltros();
    this.calcularEstadisticas();
  }

  cambiarVisibilidad(resena: Resena) {
    resena.esPublica = !resena.esPublica;
    // Aquí actualizaríamos en el backend
    console.log('Cambiar visibilidad de reseña:', resena.id, 'a', resena.esPublica ? 'pública' : 'privada');
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
