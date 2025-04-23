import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonInput,
  IonList, IonItem, IonLabel, IonBackButton, IonButtons } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonInput,
    IonList,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons
  ]
})
export class RegisterComponent {
  user = {
    nombre: '',
    apellidos: '',
    email: '',
    contrasena: '',
    telefono: ''
  };

  constructor(private router: Router) {}

  async register() {
    try {
      console.log('Registrando usuario:', this.user);
      // Cuando implementes Supabase, descomentar esta línea:
      // await this.authService.signUp(
      //   this.user.nombre,
      //   this.user.apellidos,
      //   this.user.email,
      //   this.user.contrasena,
      //   this.user.telefono
      // );
      // this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      // Mostrar alerta de error
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
