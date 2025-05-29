import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonImg,
  IonThumbnail,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonBackButton,
  IonChip,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  businessOutline,
  locationOutline,
  starOutline,
  star,
  starHalfOutline,
  wifiOutline,
  carOutline,
  accessibilityOutline,
  timeOutline,
  cashOutline,
  peopleOutline,
  chevronDownOutline,
  chevronUpOutline,
  calendarOutline
} from 'ionicons/icons';

interface Espacio {
  id: number;
  nombre: string;
  direccion: string;
  descripcion: string;
  imagen: string;
  calificacion: number;
  precio_hora: number;
  capacidad: number;
  disponible: boolean;
  servicios: {
    wifi: boolean;
    parking: boolean;
    accesible: boolean;
  };
}

interface Ubicacion {
  ciudad: string;
  expandido: boolean;
  espacios: Espacio[];
}

@Component({
  selector: 'app-espacios',
  templateUrl: './espacios.component.html',
  styleUrls: ['./espacios.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonImg,
    IonThumbnail,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonBackButton,
    IonChip,
    IonBadge
  ]
})
export class EspaciosComponent implements OnInit {
  ubicaciones: Ubicacion[] = [];

  constructor(private router: Router) {
    // Registrar los iconos que usaremos
    addIcons({
      businessOutline,
      locationOutline,
      starOutline,
      star,
      starHalfOutline,
      wifiOutline,
      carOutline,
      accessibilityOutline,
      timeOutline,
      cashOutline,
      peopleOutline,
      chevronDownOutline,
      chevronUpOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    // Cargar datos de espacios (simulado)
    this.cargarEspacios();
  }

  cargarEspacios() {
    // Esta función simula la carga de datos desde un API
    this.ubicaciones = [
      {
        ciudad: 'Murcia',
        expandido: true,
        espacios: [
          {
            id: 1,
            nombre: 'Coworking Central Murcia',
            direccion: 'Calle Mayor, 15, 30001 Murcia',
            descripcion: 'Espacio moderno con luz natural y todas las comodidades para trabajar en el centro de Murcia.',
            imagen: 'assets/images/espacios/workhub.jpg',
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
            imagen: 'assets/images/espacios/office-connect.jpg',
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
            imagen: 'assets/images/espacios/urban.jpg',
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
            imagen: 'assets/images/espacios/digital.jpg',
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
            imagen: 'assets/images/espacios/workhub.jpg',
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
            imagen: 'assets/images/espacios/urban.jpg',
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
  }

  toggleUbicacion(ubicacion: Ubicacion) {
    ubicacion.expandido = !ubicacion.expandido;
  }

  // Método para generar array con estrellas
  getEstrellas(calificacion: number): number[] {
    const totalEstrellas = 5;
    const resultado = new Array(totalEstrellas).fill(0);

    // Redondear a medio punto más cercano
    const calificacionRedondeada = Math.round(calificacion * 2) / 2;

    for (let i = 0; i < totalEstrellas; i++) {
      if (i < Math.floor(calificacionRedondeada)) {
        // Estrella completa
        resultado[i] = 2;
      } else if (i < calificacionRedondeada) {
        // Media estrella
        resultado[i] = 1;
      }
      // Las demás quedan como 0 (sin estrella)
    }

    return resultado;
  }

  // Navegar a la pantalla de nueva reserva con el ID del espacio seleccionado
  nuevaReserva(espacioId: number) {
    console.log('Navegando a nueva reserva para el espacio:', espacioId);

  }

  verDetallesEspacio(espacioId: number) {
    console.log('Ver detalles del espacio:', espacioId);
  }
}
