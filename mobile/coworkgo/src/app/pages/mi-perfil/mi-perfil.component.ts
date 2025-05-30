import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonAvatar,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButtons,
  IonBackButton,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonAccordionGroup,
  IonAccordion,
  IonBadge,
  IonFab,
  IonFabButton,
  IonChip,
  IonText,
  IonActionSheet
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  shieldCheckmarkOutline,
  notificationsOutline,
  cardOutline,
  timeOutline,
  helpCircleOutline,
  createOutline,
  lockClosedOutline,
  moonOutline,
  sunnyOutline,
  chevronDownOutline,
  chevronForwardOutline,
  logOutOutline,
  mailOutline,
  callOutline,
  saveOutline,
  alertCircleOutline,
  cameraOutline,
  closeCircleOutline,
  addCircleOutline,
  headsetOutline,
  chatbubbleEllipsesOutline,
  ticketOutline,
  cardSharp, // Icono específico para tarjetas
  card // Icono genérico para tarjetas
} from 'ionicons/icons';

interface UserProfile {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  avatar: string;
  fechaRegistro: string;
  username: string; // Añadido el nombre de usuario
}

interface PaymentMethod {
  id: string;
  type: string;
  lastDigits: string;
  expiryDate: string;
  isDefault: boolean;
}

interface Reservation {
  id: string;
  espacio: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
}

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonAvatar,
    IonItem,
    IonLabel,
    IonList,
    IonToggle,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButtons,
    IonBackButton,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonAccordionGroup,
    IonAccordion,
    IonBadge,
    IonFab,
    IonFabButton,
    IonChip,
    IonText,
    IonActionSheet
  ]
})
export class MiPerfilComponent implements OnInit {
  // Modo de tema
  isDarkMode: boolean = true;

  // Modo de edición
  editMode: boolean = false;

  // Datos del usuario
  userProfile: UserProfile = {
    id: 'usr123456',
    nombre: 'Miguel Ángel',
    apellidos: 'Ramos',
    email: 'miguelangel@example.com',
    telefono: '612345678',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    fechaRegistro: '15/04/2025',
    username: 'miguelangel_ramos'
  };

  // Copia para edición
  editableProfile: UserProfile | null = null;

  // Métodos de pago
  paymentMethods: PaymentMethod[] = [
    {
      id: 'card1',
      type: 'visa',
      lastDigits: '4567',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: 'card2',
      type: 'mastercard',
      lastDigits: '8901',
      expiryDate: '06/26',
      isDefault: false
    }
  ];

  // Preferencias de notificaciones
  notificationPreferences = {
    reservaConfirmada: true,
    recordatorioReserva: true,
    ofertas: false,
    terminosServicio: true
  };

  // Seguridad
  securitySettings = {
    lastPasswordChange: '10/10/2025',
    twoFactorEnabled: false
  };

  // Historial de reservas
  reservationHistory: Reservation[] = [
    {
      id: 'res001',
      espacio: 'Oficina Premium Centro',
      fecha: '15/04/2025',
      horaInicio: '09:00',
      horaFin: '14:00',
      estado: 'confirmada',
    },
    {
      id: 'res002',
      espacio: 'Sala de Reuniones Norte',
      fecha: '10/04/2025',
      horaInicio: '15:00',
      horaFin: '17:00',
      estado: 'completada',
    },
    {
      id: 'res003',
      espacio: 'Coworking La Plaza',
      fecha: '05/04/2025',
      horaInicio: '10:00',
      horaFin: '18:00',
      estado: 'completada',
    },
    {
      id: 'res004',
      espacio: 'Despacho Ejecutivo',
      fecha: '25/03/2025',
      horaInicio: '09:00',
      horaFin: '13:00',
      estado: 'cancelada',
    }
  ];

  // Preguntas frecuentes
  faqs = [
    {
      question: '¿Cómo puedo cancelar una reserva?',
      answer: 'Puedes cancelar tu reserva desde la sección "Mis Reservas" hasta 24 horas antes del inicio. Para cancelaciones con menos antelación, contacta con soporte.'
    },
    {
      question: '¿Qué ocurre si llego tarde a mi reserva?',
      answer: 'Tienes un margen de 30 minutos para la entrada. Pasado ese tiempo, el espacio podría ser reasignado según la política del establecimiento.'
    }
  ];

  constructor(private router: Router) {
    // Registrar los iconos
    addIcons({
      personOutline,
      shieldCheckmarkOutline,
      notificationsOutline,
      cardOutline,
      timeOutline,
      helpCircleOutline,
      createOutline,
      lockClosedOutline,
      moonOutline,
      sunnyOutline,
      chevronDownOutline,
      chevronForwardOutline,
      logOutOutline,
      mailOutline,
      callOutline,
      saveOutline,
      alertCircleOutline,
      cameraOutline,
      closeCircleOutline,
      addCircleOutline,
      headsetOutline,
      chatbubbleEllipsesOutline,
      ticketOutline,
      cardSharp,
      card
    });
  }

  ngOnInit() {
    // Cargar preferencia de tema si existe
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }
  }

  // Métodos para la interfaz
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleEditMode() {
    if (this.editMode) {
      // Salir del modo de edición sin guardar
      this.editMode = false;
      this.editableProfile = null;
    } else {
      // Entrar en modo de edición
      this.editMode = true;
      this.editableProfile = {...this.userProfile};
    }
  }

  saveProfile() {
    if (this.editableProfile) {
      this.userProfile = {...this.editableProfile};
      this.editMode = false;
      this.editableProfile = null;

      console.log('Perfil guardado con éxito');
    }
  }

  async openPhotoOptions() {
    const option = prompt('Selecciona cómo quieres cambiar tu foto: \n1. Cámara\n2. Galería\n3. Cancelar');

    if (option === '1') {
      // Simulación de tomar una foto con la cámara
      console.log('Abriendo cámara...');
      // Simulamos cambio de foto con una nueva URL
      this.userProfile.avatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';
      if (this.editableProfile) {
        this.editableProfile.avatar = this.userProfile.avatar;
      }
      alert('¡Foto actualizada con éxito!');
    }
    else if (option === '2') {
      // Simulación de seleccionar desde la galería
      console.log('Abriendo galería...');

      const randomPhotos = [
        'https://ionicframework.com/docs/img/demos/thumbnail.svg',
        'https://ionicframework.com/docs/img/demos/avatar.svg',
        'https://placehold.it/100x100?text=User'
      ];

      // Seleccionar aleatoriamente una foto
      const randomIndex = Math.floor(Math.random() * randomPhotos.length);
      this.userProfile.avatar = randomPhotos[randomIndex];
      if (this.editableProfile) {
        this.editableProfile.avatar = this.userProfile.avatar;
      }

      alert('¡Foto actualizada con éxito!');
    }
  }

  setDefaultPaymentMethod(id: string) {
    this.paymentMethods = this.paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
  }

  removePaymentMethod(id: string) {
    this.paymentMethods = this.paymentMethods.filter(method => method.id !== id);
  }

  addPaymentMethod() {
    console.log('Añadir método de pago');
  }

  navigateToChangePassword() {
    console.log('Navegar a cambiar contraseña');
    // this.router.navigate(['/change-password']);
  }

  toggleTwoFactor() {
    this.securitySettings.twoFactorEnabled = !this.securitySettings.twoFactorEnabled;
  }

  viewReservationDetails(id: string) {
    console.log('Ver detalles de reserva', id);
    // this.router.navigate(['/reservations', id]);
  }

  contactSupport() {
    console.log('Contactar con soporte');
  }

  logout() {
    console.log('Cerrar sesión');
    this.router.navigate(['/home']);
  }
}
