import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonIcon,
  IonList, IonItem, IonLabel, IonBackButton, IonButtons, IonToast } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';

  // Variables para indicadores de fortaleza de contraseña
  passwordMeetsMinLength: boolean = false;
  passwordHasNumber: boolean = false;
  passwordHasSpecial: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    addIcons({ lockClosedOutline });

    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  ngOnInit() {
    // Escuchar cambios en el campo de contraseña para actualizar indicadores
    this.resetPasswordForm.get('password')?.valueChanges.subscribe(val => {
      this.updatePasswordStrength(val);
    });

    // Opcionalmente, extraer el email desde parámetros de la URL si está disponible
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.resetPasswordForm.get('email')?.setValue(params['email']);
      }
    });
  }

  updatePasswordStrength(password: string) {
    this.passwordMeetsMinLength = password?.length >= 6;
    this.passwordHasNumber = /\d/.test(password);
    this.passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { notMatching: true };
  }

  async resetPassword() {
    if (this.resetPasswordForm.invalid) {
      this.showErrorMessage('Por favor, completa correctamente todos los campos');
      return;
    }

    try {
      const email = this.resetPasswordForm.get('email')?.value;
      const password = this.resetPasswordForm.get('password')?.value;

      await this.authService.updatePassword(password);
      this.showSuccessMessage('Contraseña actualizada exitosamente');

      // Redirigir al usuario al login después de un breve tiempo
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      this.showErrorMessage(error.message || 'Error al actualizar la contraseña');
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
    this.successMessage = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }
}
