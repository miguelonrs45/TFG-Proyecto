import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

// Interfaz para definir la estructura de una reserva
interface Reservation {
  id_reserva: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_creacion: string;
  precio_total: number;
  estado: string;
  workspaces: string[]; // Cambiado a string[] siempre (nunca undefined)
  services: string[]; // Cambiado a string[] siempre (nunca undefined)
  duration: string; // Duración calculada
  date: string; // Fecha formateada para mostrar
  startTime: string; // Hora de inicio formateada
  endTime: string; // Hora de fin formateada
}

@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class MisReservasPage implements OnInit {
  // Array para almacenar todas las reservas
  allReservations: Reservation[] = [];

  // Array filtrado para mostrar solo reservas activas
  activeReservations: Reservation[] = [];

  // Estado de carga
  isLoading: boolean = true;

  // Usuario actual
  userId: string = '';

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    // Esperar a que la sesión se cargue completamente
    try {
      const isAuthenticated = await this.authService.isSessionLoaded();

      if (isAuthenticated) {
        console.log('Usuario autenticado, cargando reservas...');
        this.loadReservations();
      } else {
        console.log('Usuario no autenticado, redirigiendo al login...');
        this.showToast('Debes iniciar sesión para ver tus reservas', 'danger');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
      this.showToast('Error al verificar la sesión', 'danger');
      // Cargar reservas dummy en caso de error
      this.addDummyReservation();
      this.isLoading = false;
    }
  }

  ionViewWillEnter() {
    // Verificar si ya estamos cargados para evitar consultas duplicadas
    if (this.allReservations.length === 0) {
      this.loadReservations();
    }
  }

  // Método para cargar las reservas desde Supabase
  async loadReservations() {
    this.isLoading = true;

    try {
      // Verificar si el usuario está autenticado
      if (!this.authService.isAuthenticated) {
        this.showToast('Debes iniciar sesión para ver tus reservas', 'danger');
        this.isLoading = false;

        // Agregar una reserva dummy para demostración si no hay autenticación
        this.addDummyReservation();
        return;
      }

      // Obtener el cliente de Supabase
      const supabase = this.authService.getSupabaseClient();

      // Obtener la sesión actual y el ID de usuario
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData || !sessionData.session || !sessionData.session.user) {
        this.showToast('No se pudo obtener la información del usuario', 'danger');
        this.isLoading = false;

        // Agregar una reserva dummy para demostración si hay error
        this.addDummyReservation();
        return;
      }

      this.userId = sessionData.session.user.id;
      console.log('ID de usuario:', this.userId);

      // Consultar las reservas del usuario
      const { data: reservasData, error: reservasError } = await supabase
        .from('Reserva')
        .select('*')
        .eq('id_usuario', this.userId)
        .order('fecha_inicio', { ascending: false });

      if (reservasError) {
        console.error('Error al cargar reservas:', reservasError);
        this.showToast('Error al cargar tus reservas', 'danger');
        this.isLoading = false;

        // Agregar una reserva dummy para demostración si hay error
        this.addDummyReservation();
        return;
      }

      // Si no hay reservas, crear una de demostración
      if (!reservasData || reservasData.length === 0) {
        console.log('No se encontraron reservas para el usuario');
        this.addDummyReservation();
        this.isLoading = false;
        return;
      }

      // Procesar las reservas obtenidas
      const processedReservations: Reservation[] = [];

      for (const reservaData of reservasData) {
        // Crear una reserva inicializada con arrays vacíos para evitar undefined
        const reserva: Reservation = {
          ...reservaData,
          workspaces: [],
          services: [],
          duration: '',
          date: '',
          startTime: '',
          endTime: ''
        };

        // Formatear datos básicos antes de consultas adicionales
        this.formatReservationData(reserva);

        // Procesar la reserva - ahora con manejo de errores mejorado
        await this.safelyLoadWorkspacesForReservation(reserva);
        await this.safelyLoadServicesForReservation(reserva);

        processedReservations.push(reserva);
      }

      this.allReservations = processedReservations;

      // Filtrar solo reservas activas o futuras
      this.filterActiveReservations();

      console.log('Reservas cargadas:', this.allReservations);
      this.isLoading = false;
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      this.showToast('Error inesperado al cargar tus reservas', 'danger');
      this.isLoading = false;

      // Agregar una reserva dummy para demostración si hay error
      this.addDummyReservation();
    }
  }

  // Versión más segura para cargar workspaces
  async safelyLoadWorkspacesForReservation(reserva: Reservation) {
    try {
      await this.loadWorkspacesForReservation(reserva);
    } catch (error) {
      console.error(`Error al cargar espacios para la reserva ${reserva.id_reserva}:`, error);
      // Si falla, asegurar que tengamos un array vacío, no undefined
      reserva.workspaces = [];
    }
  }

  // Versión más segura para cargar servicios
  async safelyLoadServicesForReservation(reserva: Reservation) {
    try {
      await this.loadServicesForReservation(reserva);
    } catch (error) {
      console.error(`Error al cargar servicios para la reserva ${reserva.id_reserva}:`, error);
      // Si falla, asegurar que tengamos un array vacío, no undefined
      reserva.services = [];
    }
  }

  // Agregar una reserva de ejemplo para demostración
  addDummyReservation() {
    const dummyReservation: Reservation = {
      id_reserva: 'demo-123',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 horas después
      fecha_creacion: new Date().toISOString(),
      precio_total: 25.50,
      estado: 'confirmada',
      workspaces: ['D103'],
      services: ['wifi', 'coffee', 'parking'],
      duration: '5 horas',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '14:00'
    };

    this.allReservations = [dummyReservation];
    this.activeReservations = [dummyReservation];
  }

  // Cargar espacios de trabajo asociados a una reserva - con mejor manejo de errores
  async loadWorkspacesForReservation(reserva: Reservation) {
  try {
    // Obtener el cliente de Supabase
    const supabase = this.authService.getSupabaseClient();

    // Primero consultamos la reserva para obtener el id_espacio
    const { data: reservaData, error: reservaError } = await supabase
      .from('Reserva')
      .select('id_espacio')
      .eq('id_reserva', reserva.id_reserva)
      .single();

    if (reservaError) {
      console.error('Error al consultar reserva:', reservaError);
      reserva.workspaces = ['Sin espacios registrados'];
      return;
    }

    if (!reservaData || !reservaData.id_espacio) {
      console.log('No se encontró información de espacio para la reserva:', reserva.id_reserva);
      reserva.workspaces = ['No asignado'];
      return;
    }

    // Ahora obtenemos información del espacio de trabajo
    const { data: espacioData, error: espacioError } = await supabase
      .from('Espacio_Trabajo')
      .select('*')
      .eq('id_espacio', reservaData.id_espacio)
      .single();

    if (espacioError) {
      console.error('Error al cargar espacio de la reserva:', espacioError);
      reserva.workspaces = ['Error al cargar'];
      return;
    }

    if (!espacioData) {
      console.log('No se encontró información del espacio');
      reserva.workspaces = ['No disponible'];
      return;
    }

    // Extraer el código o ID simple que queremos mostrar
    const match = espacioData.nombre?.match(/([OMD]\d+)/i);
    const workspaceId = match ? match[1].toUpperCase() :
                       espacioData.codigo_espacio?.toString() || 'ESP';

    // Asignar el ID del espacio
    reserva.workspaces = [workspaceId];

  } catch (error) {
    console.error('Error al cargar espacios de la reserva:', error);
    reserva.workspaces = ['Error'];
  }
}

  // Cargar servicios adicionales asociados a una reserva - con mejor manejo de errores
  async loadServicesForReservation(reserva: Reservation) {
    try {
      // Obtener el cliente de Supabase
      const supabase = this.authService.getSupabaseClient();

      // Primero obtenemos el id_pago asociado a la reserva
      const { data: pagoData, error: pagoError } = await supabase
        .from('Pago')
        .select('id_pago')
        .eq('id_reserva', reserva.id_reserva)
        .maybeSingle(); // Usar maybeSingle en lugar de single para evitar errores

      if (pagoError) {
        console.error('Error al buscar pago:', pagoError);
        reserva.services = [];
        return;
      }

      if (!pagoData || !pagoData.id_pago) {
        console.log('No se encontró pago para la reserva:', reserva.id_reserva);
        reserva.services = [];
        return;
      }

      // Obtener servicios adicionales
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('Servicio_Adicional')
        .select('*')
        .eq('id_pago', pagoData.id_pago);

      if (serviciosError) {
        console.error('Error al cargar servicios de la reserva:', serviciosError);
        reserva.services = [];
        return;
      }

      if (!serviciosData || serviciosData.length === 0) {
        console.log('No se encontraron servicios para la reserva');
        reserva.services = [];
        return;
      }

      // Convertir servicios al formato esperado por la UI
      // Extraer las propiedades booleanas como tipos de servicio
      const serviceTypes: string[] = [];

      for (const servicio of serviciosData) {
        if (servicio.wifi) serviceTypes.push('wifi');
        if (servicio.parking) serviceTypes.push('parking');
        if (servicio.accesible) serviceTypes.push('accessible');

        // Añadir según el nombre del servicio
        const nombreLower = servicio.nombre?.toLowerCase() || '';
        if (nombreLower.includes('café') || nombreLower.includes('cafe')) serviceTypes.push('coffee');
        if (nombreLower.includes('agua') || nombreLower.includes('water')) serviceTypes.push('water');
        if (nombreLower.includes('proyector')) serviceTypes.push('projector');
        if (nombreLower.includes('impresora') || nombreLower.includes('printer')) serviceTypes.push('printer');
        if (nombreLower.includes('video') || nombreLower.includes('conf')) serviceTypes.push('videoconf');
      }

      // Eliminar duplicados
      reserva.services = [...new Set(serviceTypes)];
    } catch (error) {
      console.error('Error al cargar servicios de la reserva:', error);
      // Asegurar que services siempre sea un array (nunca undefined)
      reserva.services = [];
    }
  }

  // Formatear datos de la reserva para mostrar en la UI
  formatReservationData(reserva: Reservation) {
    try {
      // Extraer fecha de fecha_inicio
      const fechaInicio = new Date(reserva.fecha_inicio);
      reserva.date = fechaInicio.toISOString().split('T')[0];

      // Formatear horas de inicio y fin
      reserva.startTime = fechaInicio.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const fechaFin = new Date(reserva.fecha_fin);
      reserva.endTime = fechaFin.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Calcular duración
      const duracionMs = fechaFin.getTime() - fechaInicio.getTime();
      const duracionHoras = Math.round(duracionMs / (1000 * 60 * 60));
      reserva.duration = `${duracionHoras} ${duracionHoras === 1 ? 'hora' : 'horas'}`;
    } catch (error) {
      console.error('Error al formatear datos de reserva:', error);
      // Valores predeterminados en caso de error
      reserva.date = 'Fecha desconocida';
      reserva.startTime = '--:--';
      reserva.endTime = '--:--';
      reserva.duration = 'Duración desconocida';
    }
  }

  // Filtrar solo reservas activas o futuras
  filterActiveReservations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear la hora para comparar solo fechas

    this.activeReservations = this.allReservations.filter(reserva => {
      // Verificar si la reserva está cancelada
      if (reserva.estado === 'cancelada') return false;

      // Verificar si la fecha de fin es posterior a hoy
      try {
        const fechaFin = new Date(reserva.fecha_fin);
        return fechaFin >= today;
      } catch (error) {
        // En caso de error con la fecha, mostrar la reserva
        return true;
      }
    });

    // Ordenar reservas por fecha (más cercanas primero)
    try {
      this.activeReservations.sort((a, b) =>
        new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
      );
    } catch (error) {
      console.error('Error al ordenar reservas:', error);
    }

    console.log('Reservas activas:', this.activeReservations);
  }

  // Cancelar una reserva
  async cancelReservation(index: number) {
    const reserva = this.activeReservations[index];

    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancelación abortada');
          }
        },
        {
          text: 'Sí, cancelar',
          handler: async () => {
            await this.cancelReservationInDatabase(reserva.id_reserva);
          }
        }
      ]
    });

    await alert.present();
  }

  // Cancelar una reserva en la base de datos
  async cancelReservationInDatabase(reservaId: string) {
    try {
      // Obtener el cliente de Supabase
      const supabase = this.authService.getSupabaseClient();

      // Actualizar el estado de la reserva a 'cancelada'
      const { error } = await supabase
        .from('Reserva')
        .update({ estado: 'cancelada' })
        .eq('id_reserva', reservaId);

      if (error) {
        throw error;
      }

      // Mostrar mensaje de éxito
      this.showToast('Reserva cancelada con éxito');

      // Recargar las reservas
      this.loadReservations();
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      this.showToast('Error al cancelar la reserva', 'danger');
    }
  }

  async navigateBack() {
    this.router.navigateByUrl('/dashboard');
  }

  // Mejorado para manejar posible undefined
  getWorkspaceIcon(workspace: string | undefined): string {
    if (!workspace) return 'location-outline';

    if (workspace.startsWith('D')) return 'desktop-outline';
    if (workspace.startsWith('O')) return 'business-outline';
    if (workspace.startsWith('M')) return 'people-outline';
    return 'location-outline';
  }

  // Mejorado para manejar posible undefined
  getWorkspaceDescription(workspaces: string[]): string {
    if (!workspaces || workspaces.length === 0) {
      return 'Espacio no especificado';
    }

    const types: {[key: string]: string} = {
      'D': 'Escritorio',
      'O': 'Oficina',
      'M': 'Sala de Reuniones'
    };

    // Verificar si el primer carácter del primer workspace existe en types
    const firstChar = workspaces[0][0];
    const type = types[firstChar] || 'Espacio';

    return `${type} ${workspaces.length > 1 ? `(${workspaces.length})` : workspaces[0]}`;
  }

  getServiceName(service: string): string {
    const names: {[key: string]: string} = {
      wifi: 'WiFi Premium',
      parking: 'Plaza de Parking',
      coffee: 'Cafetera',
      water: 'Dispensador de Agua',
      projector: 'Proyector',
      printer: 'Impresora',
      videoconf: 'Videoconferencia',
      accessible: 'Accesibilidad'
    };
    return names[service] || service;
  }

  // Mejorado para manejar posible undefined
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Fecha no disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  }

  // Mostrar toast con mensaje y color
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: color,
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
