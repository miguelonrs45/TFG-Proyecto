import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, IonCard, IonCardContent],
  template: `
    <ion-content class="auth-callback-content">
      <div class="container">
        <ion-card>
          <ion-card-content class="ion-text-center">
            <h2>Procesando inicio de sesión</h2>
            <p>Por favor espera mientras completamos el proceso...</p>
            <ion-spinner name="circular"></ion-spinner>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-callback-content {
      --background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)),
                    url('../../../assets/images/fondoLoginRegister.png') no-repeat center center / cover;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
    }
    ion-card {
      max-width: 500px;
      width: 100%;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    h2 {
      color: var(--ion-color-primary);
      margin-bottom: 10px;
    }
    p {
      color: var(--ion-color-medium);
      margin-bottom: 20px;
    }
    ion-spinner {
      width: 48px;
      height: 48px;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.handleAuthRedirect();
      if (user) {
        // Redirigir al dashboard después de autenticación exitosa
        this.router.navigate(['/dashboard']);
      } else {
        // Si no hay usuario, volver a la página de login
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error en el callback de autenticación:', error);
      this.router.navigate(['/login']);
    }
  }
}
