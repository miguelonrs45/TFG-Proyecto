import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonInput,
  IonList, IonItem, IonLabel, IonBackButton, IonButtons } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  async login() {
    try {
      console.log('Iniciando sesión con:', this.email, this.password);
      // Cuando implementes Supabase, descomentar esta línea:
      // await this.authService.signIn(this.email, this.password);
      // this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Mostrar alerta de error
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
