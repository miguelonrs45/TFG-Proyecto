// web/conexion/services/reservas-service.js
import { supabase } from './supabase-service.js';

/**
 * Clase que gestiona las operaciones relacionadas con las reservas
 */
export class ServicioReservas {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Obtiene el UUID de un espacio basado en su código visual (D1, O2, M3, etc.)
   * @param {string} codigoVisual - Código visual del espacio (e.j. 'D1', 'O2', 'M3')
   * @returns {Promise<string|null>} - UUID del espacio o null si no se encuentra
   */
  async obtenerUUIDPorCodigoVisual(codigoVisual) {
    try {
      // Extraer tipo y número
      const tipo = codigoVisual[0];
      const numero = parseInt(codigoVisual.substring(1));
      
      // Determinar el rango de códigos basado en el tipo
      let codigoEspacio;
      switch(tipo) {
        case 'D':
          codigoEspacio = numero;
          break;
        case 'O':
          codigoEspacio = 100 + numero;
          break;
        case 'M':
          codigoEspacio = 200 + numero;
          break;
        default:
          throw new Error(`Tipo de espacio desconocido: ${tipo}`);
      }
      
      // Consultar la base de datos para obtener el UUID correspondiente al código
      const { data, error } = await this.supabase
        .from('Espacio_trabajo')
        .select('id_espacio')
        .eq('codigo_espacio', codigoEspacio)
        .single();
      
      if (error || !data) {
        console.error(`Error al buscar espacio con código ${codigoEspacio}:`, error);
        return null;
      }
      
      return data.id_espacio;
    } catch (error) {
      console.error('Error al obtener UUID por código visual:', error);
      return null;
    }
  }

  /**
   * Verifica si un espacio está disponible para el período solicitado
   * @param {string} idEspacio - UUID del espacio de trabajo
   * @param {string} fechaInicio - Fecha y hora de inicio (ISO string)
   * @param {string} fechaFin - Fecha y hora de fin (ISO string)
   * @returns {Promise<boolean>} - true si está disponible, false si no
   */
  async verificarDisponibilidad(idEspacio, fechaInicio, fechaFin) {
    try {
      // Validar formato UUID
      if (!this.isValidUUID(idEspacio)) {
        console.error('ID de espacio no es un UUID válido:', idEspacio);
        return false;
      }
      
      // 1. Verificar si el espacio existe
      const { data: espacio, error: errorEspacio } = await this.supabase
        .from('Espacio_trabajo')
        .select('*')
        .eq('id_espacio', idEspacio)
        .single();

      if (errorEspacio || !espacio) {
        console.error('El espacio no existe:', errorEspacio);
        return false;
      }

      // 2. Verificar si no hay reservas conflictivas
      const { data: reservasConflictivas, error: errorReservas } = await this.supabase
        .from('Reserva')
        .select('*')
        .eq('id_espacio', idEspacio)
        .or(`fecha_inicio.lt.${fechaFin},fecha_fin.gt.${fechaInicio}`)
        .not('estado', 'eq', 'cancelada');

      if (errorReservas) {
        console.error('Error al verificar reservas conflictivas:', errorReservas);
        throw errorReservas;
      }
      
      if (reservasConflictivas && reservasConflictivas.length > 0) {
        console.log('Reservas conflictivas encontradas:', reservasConflictivas);
        return false; // Hay reservas conflictivas
      }

      // 3. Verificar disponibilidad por horario
      const { data: horarios, error: errorHorarios } = await this.supabase
        .from('Horario')
        .select('*')
        .eq('id_espacio', idEspacio);

      if (errorHorarios) {
        console.error('Error al verificar horarios:', errorHorarios);
        throw errorHorarios;
      }
      
      // Si no hay horarios definidos, asumimos disponibilidad
      if (!horarios || horarios.length === 0) {
        return true;
      }
      
      // Comprobar si el horario solicitado está dentro de los horarios disponibles
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin);
      
      // Extraer solo las horas y minutos para comparación
      const horaInicioReserva = fechaInicioObj.getHours() + fechaInicioObj.getMinutes() / 60;
      const horaFinReserva = fechaFinObj.getHours() + fechaFinObj.getMinutes() / 60;
      
      const disponiblePorHorario = horarios.some(horario => {
        // Convertir strings de hora a valores numéricos
        const [horaInicio, minInicio] = horario.hora_entrada.split(':').map(Number);
        const [horaFin, minFin] = horario.hora_salida.split(':').map(Number);
        
        const horaInicioDisponible = horaInicio + minInicio / 60;
        const horaFinDisponible = horaFin + minFin / 60;
        
        return horaInicioReserva >= horaInicioDisponible && horaFinReserva <= horaFinDisponible;
      });

      return disponiblePorHorario;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  }

  /**
   * Valida si una cadena tiene formato UUID
   * @param {string} uuid - Cadena a validar
   * @returns {boolean} - true si es un UUID válido
   */
  isValidUUID(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  /**
   * Crea una nueva reserva
   * @param {Object} datosReserva - Datos de la reserva
   * @returns {Promise<Object>} - La reserva creada
   */
  async crearReserva(datosReserva) {
    try {
      const {
        idEspacio,
        idUsuario,
        fechaInicio,
        fechaFin,
        serviciosAdicionales = []
      } = datosReserva;
      
      // Si recibimos un código visual en lugar de UUID, intentamos obtener el UUID
      let uuidEspacio = idEspacio;
      if (!this.isValidUUID(idEspacio) && typeof idEspacio === 'string' && idEspacio.length <= 4) {
        uuidEspacio = await this.obtenerUUIDPorCodigoVisual(idEspacio);
        if (!uuidEspacio) {
          throw new Error(`No se pudo encontrar el UUID para el espacio ${idEspacio}`);
        }
      } else if (!this.isValidUUID(idEspacio)) {
        throw new Error('El ID del espacio debe ser un UUID válido');
      }
      
      // 1. Verificar disponibilidad
      const disponible = await this.verificarDisponibilidad(uuidEspacio, fechaInicio, fechaFin);
      
      if (!disponible) {
        throw new Error('El espacio no está disponible para el horario seleccionado');
      }

      // 2. Obtener información del espacio para calcular precio
      const { data: espacio, error: errorEspacio } = await this.supabase
        .from('Espacio_trabajo')
        .select('*')
        .eq('id_espacio', uuidEspacio)
        .single();

      if (errorEspacio) {
        console.error('Error al obtener información del espacio:', errorEspacio);
        throw errorEspacio;
      }

      // 3. Calcular duración en horas
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin);
      const duracionMs = fechaFinObj - fechaInicioObj;
      const duracionHoras = duracionMs / (1000 * 60 * 60);

      // 4. Calcular precio base
      let precioTotal = espacio.precio_hora * duracionHoras;

      // 5. Agregar precio de servicios adicionales si existen
      if (serviciosAdicionales.length > 0) {
        // Intenta obtener precios de los servicios
        try {
          const { data: servicios, error: errorServicios } = await this.supabase
            .from('Servicio_Adicional')
            .select('id_servicio, precio')
            .in('id_servicio', serviciosAdicionales);

          if (!errorServicios && servicios && servicios.length > 0) {
            const precioServicios = servicios.reduce((total, servicio) => total + servicio.precio, 0);
            precioTotal += precioServicios;
          } else {
            // Si no podemos obtener precios reales, usamos un precio fijo por servicio
            precioTotal += serviciosAdicionales.length * 5; // 5€ por servicio como fallback
          }
        } catch (error) {
          console.warn('Error al obtener precios de servicios, usando precios predeterminados:', error);
          precioTotal += serviciosAdicionales.length * 5; // 5€ por servicio como fallback
        }
      }

      // 6. Crear la reserva
      const nuevaReserva = {
        id_usuario: idUsuario,
        id_espacio: uuidEspacio,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        fecha_creacion: new Date().toISOString(),
        precio_total: precioTotal,
        estado: 'confirmada'
      };

      const { data: reservaCreada, error: errorReserva } = await this.supabase
        .from('Reserva')
        .insert([nuevaReserva])
        .select();

      if (errorReserva) {
        console.error('Error al crear la reserva:', errorReserva);
        throw errorReserva;
      }

      // 7. Si hay servicios adicionales, crear el pago y las relaciones
      if (serviciosAdicionales.length > 0 && reservaCreada) {
        const reservaId = reservaCreada[0].id_reserva;
        
        // Crear el pago
        const nuevoPago = {
          id_reserva: reservaId,
          pago_total: precioTotal,
          metodo_pago: 'pendiente',
          fecha_pago: new Date().toISOString(),
          estado: false // No pagado inicialmente
        };

        const { data: pago, error: errorPago } = await this.supabase
          .from('Pago')
          .insert([nuevoPago])
          .select();

        if (errorPago) {
          console.error('Error al crear pago:', errorPago);
          throw errorPago;
        }

        // Asociar servicios adicionales al pago
        if (pago) {
          const pagoId = pago[0].id_pago;
          
          // Para cada servicio adicional, crear entradas en la tabla de relación
          for (const idServicio of serviciosAdicionales) {
            const { error: errorAsociacion } = await this.supabase
              .from('Servicio_Adicional')
              .update({ id_pago: pagoId })
              .eq('id_servicio', idServicio);
            
            if (errorAsociacion) {
              console.error('Error al asociar servicio:', errorAsociacion);
              // Continuamos con el siguiente servicio
            }
          }
        }
      }

      return reservaCreada[0];
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  }

  /**
   * Obtiene las reservas de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>} - Lista de reservas
   */
  async obtenerReservasUsuario(idUsuario) {
    try {
      const { data, error } = await this.supabase
        .from('Reserva')
        .select(`
          *,
          Espacio_trabajo:id_espacio (
            nombre,
            direccion,
            capacidad,
            precio_hora
          )
        `)
        .eq('id_usuario', idUsuario)
        .order('fecha_inicio', { ascending: false });

      if (error) {
        console.error('Error al obtener reservas del usuario:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error general al obtener reservas:', error);
      throw error;
    }
  }

  /**
   * Cancela una reserva
   * @param {number} idReserva - ID de la reserva
   * @returns {Promise<Object>} - La reserva actualizada
   */
  async cancelarReserva(idReserva) {
    try {
      const { data, error } = await this.supabase
        .from('Reserva')
        .update({ estado: 'cancelada' })
        .eq('id_reserva', idReserva)
        .select();

      if (error) {
        console.error('Error al cancelar reserva:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Error general al cancelar reserva:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todos los espacios disponibles para un rango de fechas
   * @param {string} fechaInicio - Fecha y hora de inicio (ISO string)
   * @param {string} fechaFin - Fecha y hora de fin (ISO string)
   * @param {string} tipoEspacio - Tipo de espacio (escritorio, oficina, sala)
   * @returns {Promise<Array>} - Lista de espacios disponibles
   */
  async obtenerEspaciosDisponibles(fechaInicio, fechaFin, tipoEspacio = null) {
    try {
      // 1. Obtener todos los espacios del tipo especificado
      let query = this.supabase.from('Espacio_trabajo').select('*');
      
      // Filtrar por tipo si se especifica
      if (tipoEspacio) {
        // Podemos adaptar esto según la estructura real de la tabla
        query = query.eq('tipo', tipoEspacio);
      }
      
      const { data: espacios, error: errorEspacios } = await query;
      
      if (errorEspacios) {
        console.error('Error al obtener espacios:', errorEspacios);
        throw errorEspacios;
      }
      
      // 2. Filtrar espacios que ya tienen reservas en el rango de fechas
      const espaciosDisponibles = [];
      
      for (const espacio of espacios) {
        const disponible = await this.verificarDisponibilidad(
          espacio.id_espacio,
          fechaInicio,
          fechaFin
        );
        
        if (disponible) {
          espaciosDisponibles.push(espacio);
        }
      }
      
      return espaciosDisponibles;
    } catch (error) {
      console.error('Error al obtener espacios disponibles:', error);
      throw error;
    }
  }
}

// Exportamos una instancia para uso directo
export const servicioReservas = new ServicioReservas();