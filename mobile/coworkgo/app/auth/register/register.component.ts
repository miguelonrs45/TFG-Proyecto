import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonText,
  IonList, IonItem, IonLabel, IonBackButton, IonButtons, IonToast } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

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
    IonInput,
    IonList,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons,
    IonToast,
    IonText
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

  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async register() {
    try {
      // Validaciones básicas - teléfono ya no es requerido
      if (!this.user.nombre || !this.user.apellidos || !this.user.email ||
          !this.user.contrasena) {
        this.showErrorMessage('Por favor, completa los campos obligatorios');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.user.email)) {
        this.showErrorMessage('Por favor, introduce un email válido');
        return;
      }

      // Validar contraseña (mínimo 6 caracteres)
      if (this.user.contrasena.length < 6) {
        this.showErrorMessage('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      console.log('Registrando usuario:', this.user);
      await this.authService.signUp(
        this.user.nombre,
        this.user.apellidos,
        this.user.email,
        this.user.contrasena,
        this.user.telefono // Ahora puede ser vacío
      );

      this.showSuccessMessage('Cuenta creada con éxito');
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      this.showErrorMessage(error.message || 'Error al registrar usuario');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 3000);
  }

  private showSuccessMessage(message: string) {
    this.errorMessage = message;
    this.showError = true; // Reutilizamos el mismo toast
    setTimeout(() => {
      this.showError = false;
    }, 3000);
  }
}
