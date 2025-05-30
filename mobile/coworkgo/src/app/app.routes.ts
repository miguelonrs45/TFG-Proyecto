import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent)
  },
  {
    path: 'mis-calificaciones',
    loadComponent: () => import('./pages/mis-calificaciones/mis-calificaciones.component').then(m => m.MisCalificacionesComponent)
  },
  {
    path: 'espacios',
    loadComponent: () => import('./pages/espacios/espacios.component').then(m => m.EspaciosComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'nueva-reserva',
    loadComponent: () => import('./pages/nueva-reserva/nueva-reserva.component').then(m => m.NuevaReservaComponent)
  },
  {
    path: 'mis-reservas',
    loadComponent: () => import('./pages/mis-reservas/mis-reservas.component').then(m => m.MisReservasPage)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
