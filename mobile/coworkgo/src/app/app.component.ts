import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, LoadingController, ToastController, Platform } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = 'coworkgo';

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(async () => {
      if (this.platform.is('capacitor')) {
        try {
          // Configura el StatusBar para dejar espacio
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch (err) {
          console.error('Error configurando Status Bar:', err);
        }
      }
    });
  }

  ngOnInit() {
    // Detectar cambios de ruta para limpiar loaders y toasts pendientes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Cerrar todos los loaders y toasts existentes
      this.dismissAllOverlays();
    });

    // También establecer un intervalo para revisar loaders olvidados
    setInterval(() => {
      this.dismissAllOverlays();
    }, 10000); // Cada 10 segundos
  }

  async dismissAllOverlays() {
    try {
      // Intentar cerrar los loading controllers
      const loadings = await this.loadingController.getTop();
      if (loadings) {
        await this.loadingController.dismiss();
      }
    } catch (err) {
      console.log('No loading controller found');
    }

    try {
      // Intentar cerrar los toast controllers
      const toast = await this.toastController.getTop();
      if (toast) {
        await this.toastController.dismiss();
      }
    } catch (err) {
      console.log('No toast controller found');
    }
  }
}
