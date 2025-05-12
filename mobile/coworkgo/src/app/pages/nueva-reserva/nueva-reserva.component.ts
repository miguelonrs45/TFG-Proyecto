import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardContent,
  IonItem, IonInput, IonSelect, IonSelectOption, IonCheckbox, IonDatetime,
  IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonBadge,
  IonLoading, IonToast, IonAlert, IonThumbnail, IonToggle, IonDatetimeButton, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  desktopOutline, businessOutline, peopleOutline, carOutline, cafeOutline,
  waterOutline, printOutline, wifiOutline, tvOutline, videocamOutline,
  clipboardOutline, calendarOutline, timeOutline, saveOutline, createOutline,
  checkmarkOutline, closeOutline, locationOutline, navigateOutline, mapOutline
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ToastController } from '@ionic/angular';

// Tipos para la aplicación
interface Workspace {
  id: string;
  name: string;
  type: 'desk' | 'office' | 'meeting';
  capacity?: number;
  features?: string[];
  occupied: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

// Interfaz para el tipado del serviceInfo
interface ServiceInfo {
  [key: string]: { name: string; icon: string };
}

// Interfaz para las ubicaciones
interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Interfaz para precios de servicios
interface PreciosServicios {
  [key: string]: number;
}

@Component({
  selector: 'app-nueva-reserva',
  templateUrl: './nueva-reserva.component.html',
  styleUrls: ['./nueva-reserva.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardContent,
    IonItem, IonInput, IonSelect, IonSelectOption, IonCheckbox, IonDatetime,
    IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonBadge,
    IonLoading, IonToast, IonAlert, IonThumbnail, IonToggle, IonDatetimeButton,
    IonModal
  ]
})
export class NuevaReservaComponent implements OnInit {
  // Propiedades que faltaban y causan errores
  private userId: string = ''; // Almacenará el ID del usuario autenticado
  private serviciosSeleccionados: string[] = []; // Almacenará los servicios seleccionados como array
  private espaciosUUIDs: Record<string, string> = {}; // Mapeo de IDs simples a UUIDs

  // Tipo de espacio de trabajo actual
  workspaceType: 'desk' | 'office' | 'meeting' = 'desk';

  // Elementos seleccionados
  selectedWorkspaces = new Set<string>();
  selectedDate: string = '';
  selectedStartTime: string = '';
  selectedEndTime: string = '';
  selectedServices = new Set<string>();

  // Nueva propiedad para almacenar la ubicación seleccionada
  selectedLocation: string = 'centro';

  // Estados de la UI
  showSelectionSummary = false;
  showBookingSummary = false;
  showLocationMap = false;
  isLoading = false;

  // Listas de datos
  workspaces: Workspace[] = [];
  availableStartTimes: string[] = [];
  availableEndTimes: string[] = [];

  // Nueva propiedad para almacenar las ubicaciones disponibles
  availableLocations: Location[] = [
    {
      id: 'centro',
      name: 'Centro de Murcia',
      address: 'Calle Mayor 42, Murcia',
      lat: 37.9922,
      lng: -1.1307
    },
    {
      id: 'libertad',
      name: 'Avenida Libertad',
      address: 'Av. de la Libertad 15, Murcia',
      lat: 37.9835,
      lng: -1.1278
    },
    {
      id: 'circular',
      name: 'Plaza Circular',
      address: 'Plaza Circular 3, Murcia',
      lat: 37.9892,
      lng: -1.1315
    },
    {
      id: 'nuevamurcia',
      name: 'Nueva Murcia',
      address: 'Av. Juan Carlos I 21, Murcia',
      lat: 37.9946,
      lng: -1.1220
    }
  ];

  // Espacios ocupados (en una app real, estos vendrían de un servicio)
  occupiedSpaces = {
    desk: ['D3', 'D7', 'D12', 'D15', 'D19'],
    office: ['O2', 'O5', 'O9', 'O13', 'O16'],
    meeting: ['M2', 'M5', 'M7', 'M9']
  };

  // Nombres de servicios e iconos para mostrar con el tipado correcto
  serviceInfo: ServiceInfo = {
    wifi: { name: 'WiFi Premium', icon: 'wifi-outline' },
    parking: { name: 'Plaza de Parking', icon: 'car-outline' },
    coffee: { name: 'Cafetera', icon: 'cafe-outline' },
    water: { name: 'Dispensador de Agua', icon: 'water-outline' },
    projector: { name: 'Proyector', icon: 'tv-outline' },
    printer: { name: 'Impresora', icon: 'print-outline' },
    videoconf: { name: 'Videoconferencia', icon: 'videocam-outline' },
    wifi_meeting: { name: 'WiFi Alta Velocidad', icon: 'wifi-outline' },
    coffee_meeting: { name: 'Servicio de Café', icon: 'cafe-outline' },
    water_meeting: { name: 'Agua Mineral', icon: 'water-outline' },
    projector_meeting: { name: 'Proyector Profesional', icon: 'tv-outline' }
  };

  // Ubicaciones de espacios de trabajo (simplificado para este ejemplo)
  workspaceLocations = {
    desk: { lat: 37.9922, lng: -1.1307, address: 'Calle Mayor 42, Murcia' },
    office: { lat: 37.9835, lng: -1.1278, address: 'Av. de la Libertad 15, Murcia' },
    meeting: { lat: 37.9892, lng: -1.1315, address: 'Plaza Circular 3, Murcia' }
  };

  // Mostrar duración
  get durationDisplay(): string {
    if (!this.selectedStartTime || !this.selectedEndTime) return '0 horas';

    const start = new Date(`2025-01-01 ${this.selectedStartTime}`);
    let end = new Date(`2025-01-01 ${this.selectedEndTime}`);

    if (this.selectedEndTime === '00:00') {
      end = new Date(`2025-01-02 00:00`);
    }

    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }

  // Mostrar rango de tiempo
  get timeRangeDisplay(): string {
    if (!this.selectedStartTime || !this.selectedEndTime) return '--:-- a --:--';
    return `${this.selectedStartTime} a ${this.selectedEndTime}`;
  }

  // Mostrar contador de seleccionados
  get selectedCount(): number {
    return this.selectedWorkspaces.size;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
       private toastController: ToastController
  ) {
    // Registrar iconos de Ionicons
    addIcons({
      desktopOutline, businessOutline, peopleOutline, carOutline, cafeOutline,
      waterOutline, printOutline, wifiOutline, tvOutline, videocamOutline,
      clipboardOutline, calendarOutline, timeOutline, saveOutline, createOutline,
      checkmarkOutline, closeOutline, locationOutline, navigateOutline, mapOutline
    });

    // Establecer la fecha de hoy como predeterminada
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];

    // Generar horas de inicio disponibles (7:00 a 23:00)
    this.generateTimeOptions();
  }

  ngOnInit() {
    // Generar espacios de trabajo para el tipo inicial (desk)
    this.generateWorkspaces();

    // Consultar los UUIDs de los espacios en la base de datos
    this.cargarUUIDsEspacios();
  }

  // Método para cargar los UUIDs de los espacios
  async cargarUUIDsEspacios() {
    try {
      // Verificar si el usuario está autenticado
      if (!this.authService.isAuthenticated) {
        console.log('Usuario no autenticado, no se pueden cargar UUIDs');
        return;
      }

      // Obtener el cliente de Supabase
      const supabase = this.authService.getSupabaseClient();

      // Obtener todos los espacios de trabajo
      const { data: espacios, error } = await supabase
        .from('Espacio_Trabajo')
        .select('id_espacio, nombre');

      if (error) {
        console.error('Error al cargar espacios de trabajo:', error);
        return;
      }

      // Crear mapeo entre el ID simple y el UUID
      this.espaciosUUIDs = {};
      espacios.forEach(espacio => {
        // Extraer el ID simple del nombre (ej: "Escritorio D1" -> "D1")
        const match = espacio.nombre.match(/([OMD]\d+)/i);
        if (match && match[1]) {
          const idSimple = match[1].toUpperCase(); // Normalizar a mayúsculas
          this.espaciosUUIDs[idSimple] = espacio.id_espacio;
        }
      });

      console.log('UUIDs de espacios cargados:', this.espaciosUUIDs);
    } catch (error) {
      console.error('Error al cargar UUIDs de espacios:', error);
    }
  }

  // Cambiar tipo de espacio de trabajo (desk, office, meeting)
  changeWorkspaceType(event: any) {
    this.workspaceType = event.detail.value;
    this.selectedWorkspaces.clear();
    this.showSelectionSummary = false;
    this.generateWorkspaces();
  }

  // Generar espacios de trabajo según el tipo seleccionado
  generateWorkspaces() {
    this.workspaces = [];

    // Obtener la ubicación seleccionada
    const location = this.availableLocations.find(loc => loc.id === this.selectedLocation);
    const locationData = location ?
      { lat: location.lat, lng: location.lng, address: location.address } :
      this.workspaceLocations[this.workspaceType];

    switch (this.workspaceType) {
      case 'desk':
        // Generar 21 escritorios (7 filas x 3 columnas)
        for (let i = 1; i <= 21; i++) {
          const id = `D${i}`;
          this.workspaces.push({
            id: id,
            name: `Escritorio ${i}`,
            type: 'desk',
            occupied: this.occupiedSpaces.desk.includes(id),
            location: locationData
          });
        }
        break;

      case 'office':
        // Generar 16 oficinas (cuadrícula 4x4)
        for (let i = 1; i <= 16; i++) {
          const id = `O${i}`;
          this.workspaces.push({
            id: id,
            name: `Oficina ${i}`,
            type: 'office',
            capacity: i % 2 === 0 ? 6 : 4,
            occupied: this.occupiedSpaces.office.includes(id),
            location: locationData
          });
        }
        break;

      case 'meeting':
        // Generar 10 salas de reuniones
        for (let i = 1; i <= 10; i++) {
          const id = `M${i}`;
          const capacity = i <= 5 ? 8 : 12;
          const hasVideoConf = i % 2 === 0;
          const hasCoffee = i > 7;

          let features = ['Proyector'];
          if (hasVideoConf) features.push('Videoconferencia');
          if (hasCoffee) features.push('Servicio de café');

          this.workspaces.push({
            id: id,
            name: `Sala de Reuniones ${i}`,
            type: 'meeting',
            capacity: capacity,
            features: features,
            occupied: this.occupiedSpaces.meeting.includes(id),
            location: locationData
          });
        }
        break;
    }
  }

  // Método para manejar el cambio de ubicación
  onLocationChange() {
    // Encontrar la ubicación seleccionada
    const location = this.availableLocations.find(loc => loc.id === this.selectedLocation);

    if (location) {
      // Actualizar las ubicaciones para todos los tipos de workspace
      this.workspaceLocations = {
        desk: { lat: location.lat, lng: location.lng, address: location.address },
        office: { lat: location.lat, lng: location.lng, address: location.address },
        meeting: { lat: location.lat, lng: location.lng, address: location.address }
      };

      // Actualizar las ubicaciones de los workspaces actuales
      this.workspaces.forEach(workspace => {
        workspace.location = {
          lat: location.lat,
          lng: location.lng,
          address: location.address
        };
      });

      // Mostrar un mensaje de confirmación
      this.showToast(`Ubicación cambiada a ${location.name}`, 'success');
    }
  }

  // Método para obtener el nombre de la ubicación seleccionada
  getSelectedLocationName(): string {
    const location = this.availableLocations.find(loc => loc.id === this.selectedLocation);
    return location ? `${location.name} - ${location.address}` : '';
  }

  // Manejar la selección de espacios de trabajo
  selectWorkspace(workspace: Workspace) {
    if (workspace.occupied) {
      this.showToast(`Este ${this.getWorkspaceTypeName()} no está disponible`, 'danger');
      return;
    }

    // Para salas de reuniones, solo permitir una selección
    if (this.workspaceType === 'meeting') {
      this.selectedWorkspaces.clear();
    }

    // Alternar selección
    if (this.selectedWorkspaces.has(workspace.id)) {
      this.selectedWorkspaces.delete(workspace.id);
    } else {
      this.selectedWorkspaces.add(workspace.id);
    }

    // Actualizar la UI
    this.showSelectionSummary = this.selectedWorkspaces.size > 0;
  }

  // Método auxiliar para convertir Set a Array (para usar en el template)
  getSelectedWorkspacesArray(): string[] {
    return Array.from(this.selectedWorkspaces);
  }

  // Comprobar si un espacio de trabajo está seleccionado
  isWorkspaceSelected(workspaceId: string): boolean {
    return this.selectedWorkspaces.has(workspaceId);
  }

  // Obtener la traducción correcta del tipo de espacio de trabajo
  getWorkspaceTypeName(): string {
    switch (this.workspaceType) {
      case 'desk': return 'escritorio';
      case 'office': return 'oficina';
      case 'meeting': return 'sala de reuniones';
      default: return 'espacio';
    }
  }

  // Generar opciones de tiempo
  generateTimeOptions() {
    // Horas de inicio (7:00 a 23:00)
    this.availableStartTimes = [];
    for (let hour = 7; hour <= 23; hour++) {
      this.availableStartTimes.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  // Actualizar opciones de hora de fin según la hora de inicio seleccionada
  updateEndTimeOptions() {
    this.availableEndTimes = [];
    this.selectedEndTime = '';

    if (!this.selectedStartTime) return;

    const startHour = parseInt(this.selectedStartTime.split(':')[0]);

    // Horas de fin (startHour+1 a 24:00)
    for (let hour = startHour + 1; hour <= 24; hour++) {
      const timeValue = hour === 24 ? '00:00' : `${hour.toString().padStart(2, '0')}:00`;
      this.availableEndTimes.push(timeValue);
    }
  }

  // Alternar selección de servicio
  toggleService(service: string) {
    if (this.selectedServices.has(service)) {
      this.selectedServices.delete(service);
    } else {
      this.selectedServices.add(service);
    }
  }

  // Comprobar si un servicio está seleccionado
  isServiceSelected(service: string): boolean {
    return this.selectedServices.has(service);
  }

  // Estado habilitado/deshabilitado del botón de confirmar reserva
  get isConfirmButtonDisabled(): boolean {
    return this.selectedWorkspaces.size === 0 ||
           !this.selectedDate ||
           !this.selectedStartTime ||
           !this.selectedEndTime;
  }

  // Formatear fecha para mostrar
  formatDate(dateStr: string): string {
    if (!dateStr) return '';

    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  // Vista previa de la reserva completa
  confirmBooking() {
    this.showBookingSummary = true;
  }

  // Guardar la reserva - MODIFICADO para usar UUIDs
  async saveBooking() {
    this.isLoading = true;

    try {
      // Verificar si el usuario está autenticado
      if (!this.authService.isAuthenticated) {
        throw new Error('Debes iniciar sesión para realizar una reserva');
      }

      console.log('Usuario autenticado, procediendo a guardar la reserva...');

      // Obtener el cliente de Supabase
      const supabase = this.authService.getSupabaseClient();
      console.log('Cliente Supabase obtenido');

      // Obtener la sesión actual y el ID de usuario
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Datos de sesión:', sessionData);

      if (!sessionData || !sessionData.session || !sessionData.session.user) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      // Guardar el ID de usuario en la propiedad
      this.userId = sessionData.session.user.id;
      console.log('ID de usuario:', this.userId);

      // Si no se han cargado los UUIDs, intentar cargarlos de nuevo
      if (Object.keys(this.espaciosUUIDs).length === 0) {
        await this.cargarUUIDsEspacios();

        if (Object.keys(this.espaciosUUIDs).length === 0) {
          throw new Error('No se pudieron cargar los espacios de trabajo. Por favor, inténtalo de nuevo.');
        }
      }

      // Verificar que tengamos UUIDs para los espacios seleccionados
      const espaciosSeleccionados = Array.from(this.selectedWorkspaces);
      console.log('Espacios seleccionados:', espaciosSeleccionados);

      // Comprobar si tenemos los UUIDs para todos los espacios seleccionados
      const espaciosConUUID = espaciosSeleccionados.filter(id => !!this.espaciosUUIDs[id]);

      if (espaciosConUUID.length !== espaciosSeleccionados.length) {
        const espaciosFaltantes = espaciosSeleccionados.filter(id => !this.espaciosUUIDs[id]);
        console.error('No se encontraron UUIDs para algunos espacios:', espaciosFaltantes);
        throw new Error(`No se encontraron datos para algunos espacios: ${espaciosFaltantes.join(', ')}`);
      }

      // Convertir el Set de servicios a un array
      this.serviciosSeleccionados = Array.from(this.selectedServices);

      // Calcular fecha y hora de inicio y fin
      const [year, month, day] = this.selectedDate.split('-').map(num => parseInt(num));

      const startHour = parseInt(this.selectedStartTime.split(':')[0]);
      const endHour = this.selectedEndTime === '00:00' ? 24 : parseInt(this.selectedEndTime.split(':')[0]);

      const fechaInicio = new Date(year, month - 1, day, startHour, 0);
      const fechaFin = new Date(year, month - 1, day, endHour, 0);

      // Calcular la duración en horas para el precio
      const horasReserva = endHour - startHour;

      // Calcular precio total basado en el tipo de espacio y la duración
      const precioBase = this.calcularPrecioBase(horasReserva);
      const precioServicios = this.calcularPrecioServicios();
      const precioTotal = precioBase + precioServicios;

      console.log('Datos de la reserva calculados:', {
        fechaInicio,
        fechaFin,
        horasReserva,
        precioTotal,
        espacios: espaciosSeleccionados,
        servicios: Array.from(this.selectedServices)
      });

      // Crear objeto para la reserva en la base de datos
      const nuevaReserva = {
        id_usuario: this.userId,
        precio_total: precioTotal,
        estado: 'pendiente',
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        fecha_creacion: new Date().toISOString()
      };

      console.log('Insertando reserva en la base de datos:', nuevaReserva);

      // Insertar la reserva en la base de datos
      const { data: reservaData, error: reservaError } = await supabase
        .from('Reserva')
        .insert(nuevaReserva)
        .select('id_reserva')
        .single();

      if (reservaError) {
        console.error('Error al insertar reserva:', reservaError);
        throw reservaError;
      }

      console.log('Reserva insertada con éxito. ID:', reservaData.id_reserva);

      // Crear un registro de pago asociado a la reserva
      const nuevoPago = {
        pago_total: precioTotal,
        metodo_pago: 'tarjeta',
        fecha_pago: new Date().toISOString(),
        estado: false, // Pendiente de pago
        id_reserva: reservaData.id_reserva
      };

      console.log('Insertando pago en la base de datos:', nuevoPago);

      const { data: pagoData, error: pagoError } = await supabase
        .from('Pago')
        .insert(nuevoPago)
        .select('id_pago')
        .single();

      if (pagoError) {
        console.error('Error al insertar pago:', pagoError);
        throw pagoError;
      }

      console.log('Pago insertado con éxito. ID:', pagoData.id_pago);

      // Para cada servicio seleccionado, creamos un registro en Servicio_Adicional
      if (this.selectedServices.size > 0) {
        try {
          await this.insertarServiciosAdicionales(
            pagoData.id_pago,
            this.userId
          );
        } catch (error) {
          console.error('Error al insertar servicios:', error);
          throw error;
        }
      }

      // Registrar horarios para cada espacio
      for (const espacioId of this.selectedWorkspaces) {
        // Usar el UUID real del espacio
        const uuidEspacio = this.espaciosUUIDs[espacioId];

        if (!uuidEspacio) {
          console.error(`No se encontró UUID para el espacio ${espacioId}`);
          continue;
        }

        const nuevoHorario = {
          tiempo: new Date().toISOString(),
          hora_entrada: this.selectedStartTime,
          hora_salida: this.selectedEndTime,
          id_espacio: uuidEspacio  // Usar el UUID real
        };

        console.log(`Insertando horario para espacio ${espacioId} con UUID ${uuidEspacio}:`, nuevoHorario);

        const { error: horarioError } = await supabase
          .from('Horario')
          .insert(nuevoHorario);

        if (horarioError) {
          console.error(`Error al insertar horario para espacio ${espacioId}:`, horarioError);
          throw horarioError;
        }

        console.log(`Horario para espacio ${espacioId} insertado con éxito`);
      }

      console.log('Reserva completa guardada con éxito');

      // Mostrar mensaje de éxito
      this.showToast('¡Reserva guardada con éxito!', 'success');

      // IMPORTANTE: Navegar al dashboard inmediatamente en lugar de esperar
      this.router.navigate(['/dashboard']).then(() => {
        console.log('Navegación a dashboard completada');
      }).catch(navError => {
        console.error('Error al navegar a dashboard:', navError);
      });
    } catch (error: unknown) {
      console.error('Error general al guardar la reserva:', error);

      // Manejo de error tipo unknown
      let errorMessage = 'Error desconocido';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message as string;
      }

      this.showToast('Error al guardar la reserva: ' + errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  // Método para insertar servicios adicionales - MODIFICADO para usar UUIDs
  async insertarServiciosAdicionales(idPago: string, idUsuario: string): Promise<void> {
    try {
      console.log("Insertando servicios adicionales:", this.serviciosSeleccionados);

      // Obtener el cliente de Supabase
      const supabase = this.authService.getSupabaseClient();

      // Obtener el UUID del primer espacio seleccionado para asociar los servicios
      const primerEspacioId = Array.from(this.selectedWorkspaces)[0];
      const uuidEspacio = this.espaciosUUIDs[primerEspacioId];

      if (!uuidEspacio) {
        throw new Error(`No se encontró UUID para el espacio ${primerEspacioId}`);
      }

      // Procesar cada servicio seleccionado
      for (const servicio of this.serviciosSeleccionados) {
        try {
          // Preparar datos del servicio con el UUID correcto
          const datosServicio = {
            nombre: this.obtenerNombreServicio(servicio),
            descripcion: 'Servicio adicional para la reserva',
            precio: this.obtenerPrecioServicio(servicio),
            wifi: servicio === 'wifi',
            parking: servicio === 'parking',
            accesible: servicio === 'accessible',
            id_pago: idPago,
            id_usuario: idUsuario,
            id_espacio: uuidEspacio // Usar el UUID real del espacio
          };

          console.log("Datos del servicio a insertar:", datosServicio);

          // Insertar el servicio
          const { data, error } = await supabase
            .from('Servicio_Adicional')
            .insert(datosServicio)
            .select();

          if (error) throw error;
          console.log("Servicio insertado con éxito:", data);

        } catch (error) {
          console.error("Error al insertar servicio individual:", error);
          console.error("Servicio que causó el error:", servicio);
          // Continuar con el siguiente servicio
        }
      }
    } catch (error) {
      console.error("Error al insertar servicios adicionales:", error);
      throw error;
    }
  }

  // Métodos para obtener datos de los servicios
  private obtenerNombreServicio(servicio: string): string {
    const nombresServicios: Record<string, string> = {
      'parking': 'Plaza de Parking',
      'wifi': 'WiFi de Alta Velocidad',
      'coffee': 'Servicio de Café',
      'projector': 'Proyector',
      'accessible': 'Accesibilidad'
    };
    return nombresServicios[servicio] || `Servicio ${servicio}`;
  }

  private obtenerPrecioServicio(servicio: string): number {
    const preciosServicios: Record<string, number> = {
      'parking': 10,
      'wifi': 5,
      'coffee': 3,
      'projector': 15,
      'accessible': 0
    };
    return preciosServicios[servicio] || 0;
  }

  // Calcular precio base según el tipo de espacio y duración
  calcularPrecioBase(horas: number): number {
    const tarifasBase: {[key: string]: number} = {
      'desk': 10, // €/hora
      'office': 25, // €/hora
      'meeting': 40 // €/hora
    };

    const tarifa = tarifasBase[this.workspaceType] || 10;
    return tarifa * horas * this.selectedWorkspaces.size;
  }

  // Calcular precio total de servicios adicionales
  calcularPrecioServicios(): number {
    let total = 0;

    for (const servicio of this.selectedServices) {
      total += this.getPrecioServicio(servicio);
    }

    return total;
  }

  // Obtener precio individual de un servicio
  getPrecioServicio(servicioKey: string): number {
    // Definición con tipo explícito
    const preciosServicios: PreciosServicios = {
      'wifi': 5,
      'parking': 10,
      'coffee': 3,
      'water': 2,
      'projector': 15,
      'printer': 8,
      'videoconf': 20,
      'wifi_meeting': 10,
      'coffee_meeting': 6,
      'water_meeting': 4,
      'projector_meeting': 25
    };

    // Ahora TypeScript entiende que podemos usar una cadena para indexar
    return preciosServicios[servicioKey] || 5; // Valor por defecto: 5€
  }

  // Modificar reserva (volver al formulario)
  modifyBooking() {
    this.showBookingSummary = false;
  }

  // Mostrar mapa de ubicación
  toggleLocationMap() {
    this.showLocationMap = !this.showLocationMap;
  }

  // Obtener nombre del servicio para mostrar
  getServiceName(service: string): string {
    return this.serviceInfo[service]?.name || service;
  }

  // Obtener icono del servicio para mostrar
  getServiceIcon(service: string): string {
    return this.serviceInfo[service]?.icon || 'add-outline';
  }

  // Navegación hacia atrás con confirmación si es necesario
  navigateBack() {
    if (this.hasUnsavedChanges()) {
      this.showConfirmationDialog();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Comprobar si hay cambios sin guardar
  hasUnsavedChanges(): boolean {
    return this.selectedWorkspaces.size > 0 ||
           this.selectedServices.size > 0 ||
           (this.selectedStartTime !== '' && this.selectedEndTime !== '');
  }

  // Mostrar diálogo de confirmación para cambios sin guardar
  async showConfirmationDialog() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Cambios sin guardar';
    alert.message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
    alert.buttons = [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Salir',
        handler: () => {
          this.router.navigate(['/dashboard']);
        }
      }
    ];

    document.body.appendChild(alert);
    await alert.present();
  }

  // Mostrar mensaje toast
  async showToast(message: string, color: string = 'primary') {
  const toast = await this.toastController.create({
    message: message,
    duration: 2000,
    position: 'top',
    color: color
  });

  await toast.present();
}
}
