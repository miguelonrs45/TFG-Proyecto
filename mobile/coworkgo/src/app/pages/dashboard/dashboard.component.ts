import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  listOutline,
  businessOutline,
  personOutline,
  notificationsOutline,
  starOutline,
  moonOutline,
  sunnyOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonButton
  ]
})
export class DashboardComponent implements OnInit {
  isDarkMode: boolean = true; // Por defecto en modo oscuro

  constructor(private router: Router, private renderer: Renderer2) {
    // Registrar los iconos que utilizaremos
    addIcons({
      addOutline,
      listOutline,
      businessOutline,
      personOutline,
      notificationsOutline,
      starOutline,
      moonOutline,
      sunnyOutline
    });

    // Cargar preferencia de tema si existe
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }
  }

  ngOnInit() {
    // Aplicar animaciones con retraso para efecto cascada
    this.applyEntryAnimations();

    // Iniciar animación de notificaciones si hay alertas
    setTimeout(() => {
      if (this.hasNotifications) {
        const notificationIcon = document.querySelector('ion-button[ng-reflect-name="notifications-outline"] ion-icon');
        if (notificationIcon) {
          this.renderer.addClass(notificationIcon, 'notification-animation');
        }
      }
    }, 2000);
  }

  // Método para alternar entre tema oscuro y claro
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  // Aplicar animaciones de entrada con retraso
  applyEntryAnimations() {
    // Método simplificado que garantiza que los elementos siempre sean visibles
    setTimeout(() => {
      const elements = document.querySelectorAll('.animate-entry');
      elements.forEach((el, index) => {
        const element = el as HTMLElement;
        // Hacer el elemento inmediatamente visible (fallback)
        element.style.opacity = '1';

        // Aplicar la animación
        element.style.animation = `slideUp 0.6s ease-out ${100 + (index * 100)}ms both`;
      });
    }, 100);
  }

  navigate(route: string) {
    // Añadir animación de transición de página
    const content = document.querySelector('ion-content');
    if (content) {
      this.renderer.addClass(content, 'page-transition');
      setTimeout(() => {
        this.router.navigate([route]);
      }, 300);
    } else {
      this.router.navigate([route]);
    }
  }

  // Por ahora, estas funciones solo mostrarán mensajes en consola
  // ya que las rutas aún no están implementadas

  nuevaReserva() {
    console.log('Navegando a Nueva Reserva');
    this.navigate('/nueva-reserva');
  }

  misReservas() {
    console.log('Navegando a Mis Reservas');
    this.navigate('/mis-reservas');
  }

  espacios() {
    console.log('Navegando a Espacios');
    this.navigate('/espacios');
  }

  misCalificaciones() {
    console.log('Navegando a Mis Calificaciones');
    this.navigate('/mis-calificaciones');
  }

  miPerfil() {
    console.log('Navegando a Mi Perfil');
    this.navigate('/mi-perfil');
  }

  // Simular notificaciones
  hasNotifications: boolean = true;

  showNotifications() {
    console.log('Mostrando notificaciones');
    // Simular un popover con notificaciones
    const alertMessage = '• Nueva oferta disponible\n• Tu reserva está confirmada\n• Nuevas reseñas recibidas';
    alert('Notificaciones:\n' + alertMessage);

    // Simular que ya se vieron las notificaciones
    const notificationIcon = document.querySelector('ion-button ion-icon[name="notifications-outline"]');
    if (notificationIcon && this.hasNotifications) {
      this.renderer.removeClass(notificationIcon, 'notification-animation');
      this.hasNotifications = false;
    }
  }
}
