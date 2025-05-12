import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonInput,
  IonList, IonItem, IonLabel, IonBackButton, IonButtons, IonToast, IonIcon } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';

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
    IonInput,
    IonList,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons,
    IonToast,
    IonIcon
  ]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    addIcons({ logoGoogle });
  }

  async login() {
    try {
      if (!this.email || !this.password) {
        this.showErrorMessage('Por favor, completa todos los campos');
        return;
      }

      console.log('Iniciando sesión con:', this.email);
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      this.showErrorMessage(error.message || 'Error al iniciar sesión. Verifica tus credenciales');
    }
  }

  // Nuevo método para login con Google
  async loginWithGoogle() {
    try {
      this.isLoading = true;
      await this.authService.signInWithGoogle();
      // La redirección la maneja Google y luego el componente AuthCallbackComponent
    } catch (error: any) {
      this.isLoading = false;
      console.error('Error al iniciar sesión con Google:', error);
      this.showErrorMessage(error.message || 'Error al iniciar sesión con Google');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar contraseña',
      message: 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
          value: this.email // Pre-llenamos con el email si ya lo escribió
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Enviar',
          cssClass: 'confirm-button',
          handler: async (data) => {
            try {
              if (!data.email) {
                this.showErrorMessage('Por favor, ingresa tu correo electrónico');
                return false;
              }

              await this.authService.resetPassword(data.email);
              this.showSuccessMessage('Se ha enviado un correo para restablecer tu contraseña');
              return true;
            } catch (error: any) {
              console.error('Error al solicitar restablecimiento:', error);
              this.showErrorMessage(error.message || 'No se pudo enviar el correo de recuperación');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 3000);
  }

  private showSuccessMessage(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }
}
