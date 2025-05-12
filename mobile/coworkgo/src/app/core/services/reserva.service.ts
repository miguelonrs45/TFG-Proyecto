import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    // Reutilizamos la instancia de Supabase del AuthService
    this.supabase = this.authService.getSupabaseClient();
  }

  /**
   * Crea una nueva reserva y sus servicios asociados
   */
  async crearReserva(datos: {
    id_usuario: string,
    id_espacio: string[],
    fecha_inicio: Date,
    fecha_fin: Date,
    precio_total: number,
    servicios: string[]
  }) {
    try {
      // 1. Crear la reserva principal
      const { data: reserva, error: reservaError } = await this.supabase
        .from('Reserva')
        .insert({
          id_usuario: datos.id_usuario,
          precio_total: datos.precio_total,
          estado: 'pendiente',
          fecha_inicio: datos.fecha_inicio.toISOString(),
          fecha_fin: datos.fecha_fin.toISOString(),
          fecha_creacion: new Date().toISOString()
        })
        .select('id_reserva')
        .single();

      if (reservaError) throw reservaError;

      // 2. Si la reserva se creó correctamente, registrar el pago
      const { data: pago, error: pagoError } = await this.supabase
        .from('Pago')
        .insert({
          pago_total: datos.precio_total,
          metodo_pago: 'pendiente', // Se definirá en el proceso de pago
          fecha_pago: new Date().toISOString(),
          estado: false, // Pago pendiente
          id_reserva: reserva.id_reserva
        })
        .select('id_pago')
        .single();

      if (pagoError) throw pagoError;

      // 3. Para cada servicio adicional seleccionado, crear un registro
      if (datos.servicios && datos.servicios.length > 0) {
        const serviciosData = datos.servicios.map(servicio => {
          // Mapear el tipo de servicio a los valores de la base de datos
          let servicioData: any = {
            id_pago: pago.id_pago,
            id_usuario: datos.id_usuario,
            nombre: this.mapearNombreServicio(servicio),
            descripcion: 'Servicio adicional',
            precio: this.calcularPrecioServicio(servicio),
            wifi: servicio.includes('wifi'),
            parking: servicio.includes('parking'),
            accesible: true
          };

          // Asignar el primer espacio como id_espacio (podríamos mejorarlo para múltiples espacios)
          if (datos.id_espacio && datos.id_espacio.length > 0) {
            servicioData.id_espacio = datos.id_espacio[0];
          }

          return servicioData;
        });

        const { error: serviciosError } = await this.supabase
          .from('Servicio_Adicional')
          .insert(serviciosData);

        if (serviciosError) throw serviciosError;
      }

      // 4. Registrar la reserva para cada espacio seleccionado
      for (const espacio of datos.id_espacio) {
        // Crear registro en Horario para cada espacio reservado
        const { error: horarioError } = await this.supabase
          .from('Horario')
          .insert({
            id_espacio: espacio,
            tiempo: new Date().toISOString(),
            hora_entrada: this.extraerHora(datos.fecha_inicio),
            hora_salida: this.extraerHora(datos.fecha_fin)
          });

        if (horarioError) throw horarioError;
      }

      return { success: true, reservaId: reserva.id_reserva };
    } catch (error) {
      console.error('Error al crear reserva:', error);
      return { success: false, error };
    }
  }

  // Obtener solo la parte de la hora de una fecha
  private extraerHora(fecha: Date): string {
    return fecha.toTimeString().split(' ')[0];
  }

  // Mapear servicios al nombre en la base de datos
  private mapearNombreServicio(servicio: string): string {
    const nombresServicios: {[key: string]: string} = {
      'wifi': 'WiFi Premium',
      'parking': 'Plaza de Parking',
      'coffee': 'Servicio de Café',
      'water': 'Dispensador de Agua',
      'projector': 'Proyector',
      'printer': 'Impresora',
      'videoconf': 'Sistema de Videoconferencia',
      'wifi_meeting': 'WiFi Alta Velocidad',
      'coffee_meeting': 'Servicio de Café Premium',
      'water_meeting': 'Servicio de Agua Mineral',
      'projector_meeting': 'Proyector Profesional'
    };

    return nombresServicios[servicio] || servicio;
  }

  // Calcular precio de cada servicio
  private calcularPrecioServicio(servicio: string): number {
    const preciosServicios: {[key: string]: number} = {
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

    return preciosServicios[servicio] || 5; // valor por defecto
  }

  // Calcular precio total de la reserva
  calcularPrecioTotal(espaciosTipo: string, cantidad: number, horas: number, servicios: string[]): number {
    // Precios base por hora según tipo de espacio
    const precioBaseHora: {[key: string]: number} = {
      'desk': 8,
      'office': 25,
      'meeting': 40
    };

    let precioBase = precioBaseHora[espaciosTipo] * cantidad * horas;

    // Sumar precio de servicios adicionales
    const precioServicios = servicios.reduce((total, servicio) => {
      return total + this.calcularPrecioServicio(servicio);
    }, 0);

    return precioBase + precioServicios;
  }

  // Obtener espacios de trabajo disponibles
  async obtenerEspacios(tipo: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('Espacio_trabajo')
        .select('*')
        .eq('tipo', tipo);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener espacios:', error);
      return [];
    }
  }

  // Verificar disponibilidad de un espacio en una fecha/hora
  async verificarDisponibilidad(idEspacio: string, fechaInicio: Date, fechaFin: Date): Promise<boolean> {
    try {
      // Buscar reservas que coincidan con el horario solicitado
      const { data, error } = await this.supabase
        .from('Horario')
        .select('*')
        .eq('id_espacio', idEspacio)
        .lte('hora_entrada', this.extraerHora(fechaFin))
        .gte('hora_salida', this.extraerHora(fechaInicio));

      if (error) throw error;

      // Si no hay resultados, el espacio está disponible
      return data?.length === 0;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
  }
}
