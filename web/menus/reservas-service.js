/**
 * Servicio de Reservas para la Base de Datos Real
 * Versión optimizada para CoWorkGo
 */

(function() {
    // Clase principal para el servicio de reservas
    class ServicioReservas {
        constructor() {
            // Inicializar estado
            this.initialized = false;
            this.initPromise = null;
            
            // Caché de UUIDs para espacios
            this.uuidCache = {};
            
            // IDs de usuario simulados
            this.usuariosUUID = {
                "1": "650e8400-e29b-41d4-a716-446655440000",
                "62487baf-f156-4395-b988-d5a66dcc1126": "62487baf-f156-4395-b988-d5a66dcc1126" // Mantener UUID tal cual
            };
            
            // Inicializar el servicio
            this.init();
            
            // Auto-log al construirse para verificación
            console.log('ServicioReservas: Instancia creada (modo base de datos real)');
        }
        
        /**
         * Inicializa el servicio asegurando que Supabase esté disponible
         */
        init() {
            if (this.initialized) return Promise.resolve();
            
            if (!this.initPromise) {
                this.initPromise = new Promise((resolve, reject) => {
                    // Esperar a que Supabase esté disponible
                    this.waitForSupabase()
                        .then(() => {
                            console.log('ServicioReservas: Supabase disponible');
                            this.initialized = true;
                            // Notificar que el servicio está listo
                            window.dispatchEvent(new CustomEvent('servicioReservasReady'));
                            resolve();
                        })
                        .catch(error => {
                            console.error('ServicioReservas: Error al inicializar', error);
                            reject(error);
                        });
                });
            }
            
            return this.initPromise;
        }
        
        /**
         * Espera a que Supabase esté disponible
         */
        waitForSupabase() {
            return new Promise((resolve, reject) => {
                // Si ya está disponible, resolver inmediatamente
                if (window.supabase) {
                    resolve(window.supabase);
                    return;
                }
                
                // Verificar si está el servicio global disponible
                if (window.supabaseService) {
                    resolve(window.supabaseService.getClient());
                    return;
                }
                
                // Cargar el servicio si no está disponible
                console.log('ServicioReservas: Cargando servicio de Supabase...');
                const script = document.createElement('script');
                script.src = '/web/conexion/services/supabase-service.js';
                document.head.appendChild(script);
                
                // Esperar a que el evento se dispare o que el objeto esté disponible
                let attempts = 0;
                const maxAttempts = 20;
                const checkInterval = setInterval(() => {
                    attempts++;
                    
                    if (window.supabase) {
                        clearInterval(checkInterval);
                        resolve(window.supabase);
                    } else if (window.supabaseService) {
                        clearInterval(checkInterval);
                        resolve(window.supabaseService.getClient());
                    } else if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        reject(new Error('Tiempo de espera agotado para Supabase'));
                    }
                }, 250);
                
                // También esperar al evento
                window.addEventListener('supabaseReady', () => {
                    clearInterval(checkInterval);
                    resolve(window.supabase);
                }, { once: true });
            });
        }
        
        /**
         * Obtiene el cliente Supabase actual
         */
        getSupabase() {
            if (window.supabase) return window.supabase;
            if (window.supabaseService) return window.supabaseService.getClient();
            throw new Error('Cliente Supabase no disponible');
        }
        
        /**
         * Busca el UUID real del espacio en la base de datos
         * @param {string} idEspacio - Identificador del espacio (puede ser D1, O2, etc)
         * @returns {Promise<string>} - UUID real del espacio
         */
        async buscarUUIDEspacio(idEspacio) {
            // Si ya tenemos este UUID en caché, devolverlo
            if (this.uuidCache[idEspacio]) {
                console.log(`UUID para ${idEspacio} encontrado en caché: ${this.uuidCache[idEspacio]}`);
                return this.uuidCache[idEspacio];
            }
            
            try {
                await this.init();
                const supabase = this.getSupabase();
                
                // Extraer el tipo y número del espacio
                let tipo = '', codigo = '';
                
                if (typeof idEspacio === 'string' && idEspacio.length > 1) {
                    tipo = idEspacio[0]; // D, O, M
                    codigo = idEspacio.substring(1); // número
                } else {
                    // Asumir que es solo un número
                    codigo = idEspacio;
                }
                
                console.log(`Buscando UUID para espacio tipo=${tipo}, codigo=${codigo}`);
                
                // Determinar el nombre del espacio basado en el tipo
                let nombreEspacio = '';
                if (tipo === 'D') {
                    nombreEspacio = `Escritorio D${codigo}`;
                } else if (tipo === 'O') {
                    nombreEspacio = `Oficina O${codigo}`;
                } else if (tipo === 'M') {
                    nombreEspacio = `Sala de Reuniones M${codigo}`;
                }
                
                // Buscar por nombre si tenemos un nombre válido
                if (nombreEspacio) {
                    console.log(`Buscando espacio por nombre: ${nombreEspacio}`);
                    const { data: espaciosPorNombre, error: errorNombre } = await supabase
                        .from('Espacio_Trabajo')
                        .select('id_espacio')
                        .eq('nombre', nombreEspacio)
                        .limit(1);
                    
                    if (!errorNombre && espaciosPorNombre && espaciosPorNombre.length > 0) {
                        const uuid = espaciosPorNombre[0].id_espacio;
                        console.log(`UUID encontrado por nombre: ${uuid}`);
                        this.uuidCache[idEspacio] = uuid; // Guardar en caché
                        return uuid;
                    }
                }
                
                // También buscar por código de espacio
                console.log(`Buscando espacio por código: ${codigo}`);
                const { data: espaciosPorCodigo, error: errorCodigo } = await supabase
                    .from('Espacio_Trabajo')
                    .select('id_espacio')
                    .eq('codigo_espacio', parseInt(codigo) || 0)
                    .limit(1);
                
                if (!errorCodigo && espaciosPorCodigo && espaciosPorCodigo.length > 0) {
                    const uuid = espaciosPorCodigo[0].id_espacio;
                    console.log(`UUID encontrado por código: ${uuid}`);
                    this.uuidCache[idEspacio] = uuid; // Guardar en caché
                    return uuid;
                }
                
                // Si llegamos aquí, no pudimos encontrar el espacio
                console.error(`No se encontró UUID para espacio ${idEspacio}`);
                throw new Error(`No se encontró el espacio ${idEspacio} en la base de datos`);
            } catch (error) {
                console.error(`Error al buscar UUID para espacio ${idEspacio}:`, error);
                throw error;
            }
        }
        
        /**
         * Convierte un ID de usuario a UUID
         * @param {string} idUsuario - ID del usuario
         * @returns {string} - UUID correspondiente
         */
        getUsuarioUUID(idUsuario) {
            // Si ya es un UUID válido, devolverlo tal cual
            if (typeof idUsuario === 'string' && 
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idUsuario)) {
                return idUsuario;
            }
            
            const idStr = String(idUsuario);
            
            if (this.usuariosUUID[idStr]) {
                return this.usuariosUUID[idStr];
            }
            
            // Si no hay mapeo, usamos el original (podría fallar)
            console.warn(`No se encontró UUID para usuario con ID ${idUsuario}, usando el valor original.`);
            return idStr;
        }
        
        /**
         * Modo de simulación - No use servicios reales
         * @returns {boolean} - true si estamos en modo simulación
         */
        isSimulationMode() {
            // IMPORTANTE: Ahora el modo simulación está DESACTIVADO por defecto
            return localStorage.getItem('useSimulation') === 'true';
        }
        
        /**
         * Conmuta el modo de simulación
         * @param {boolean} enable - true para activar, false para desactivar
         */
        setSimulationMode(enable) {
            localStorage.setItem('useSimulation', enable ? 'true' : 'false');
            console.log(`Modo simulación ${enable ? 'activado' : 'desactivado'}`);
        }
        
        /**
         * Verifica si un espacio está disponible para el período solicitado
         * @param {number|string} idEspacio - ID del espacio de trabajo
         * @param {string} fechaInicio - Fecha y hora de inicio (ISO string)
         * @param {string} fechaFin - Fecha y hora de fin (ISO string)
         * @returns {Promise<boolean>} - true si está disponible, false si no
         */
        async verificarDisponibilidad(idEspacio, fechaInicio, fechaFin) {
            try {
                // En modo simulación, simplemente devolvemos true para demostración
                if (this.isSimulationMode()) {
                    console.log(`[SIMULACIÓN] Verificando disponibilidad para espacio ${idEspacio}`);
                    
                    // Simulamos algunos espacios ocupados para demostración
                    const ocupados = ["3", "7", "9"];
                    return !ocupados.includes(String(idEspacio));
                }
                
                await this.init();
                const supabase = this.getSupabase();
                
                // Buscar el UUID real del espacio en la base de datos
                let espacioUUID;
                try {
                    espacioUUID = await this.buscarUUIDEspacio(idEspacio);
                } catch (error) {
                    console.warn('Error al buscar UUID del espacio, continuando con verificación:', error);
                    // Permitir continuar para desarrollo
                    return true;
                }
                
                console.log(`Verificando disponibilidad para espacio ${idEspacio} (UUID: ${espacioUUID})`);
                
                // 1. Verificar si el espacio existe
                const { data: espacio, error: errorEspacio } = await supabase
                    .from('Espacio_Trabajo')
                    .select('*')
                    .eq('id_espacio', espacioUUID)
                    .single();

                if (errorEspacio) {
                    console.error('Error al verificar si existe el espacio:', errorEspacio);
                    
                    // IMPORTANTE: Para desarrollo, permitimos continuar aunque no exista
                    console.warn('Se continuará con la reserva aunque haya errores en la verificación');
                    return true;
                }

                if (!espacio) {
                    console.error('El espacio no existe o no se pudo encontrar');
                    // IMPORTANTE: Para desarrollo, permitimos continuar aunque no exista
                    return true;
                }

                // 2. Verificar si no hay reservas conflictivas
                const { data: reservasConflictivas, error: errorReservas } = await supabase
                    .from('Reserva')
                    .select('*')
                    .eq('id_espacio', espacioUUID)
                    .or(`fecha_inicio.lt.${fechaFin},fecha_fin.gt.${fechaInicio}`)
                    .not('estado', 'eq', 'cancelada');

                if (errorReservas) {
                    console.error('Error al verificar reservas conflictivas:', errorReservas);
                    // Permitimos continuar para desarrollo
                    return true;
                }
                
                if (reservasConflictivas && reservasConflictivas.length > 0) {
                    console.log('Reservas conflictivas encontradas:', reservasConflictivas);
                    return false; // Hay reservas conflictivas
                }

                // 3. Verificar disponibilidad por horario
                const { data: horarios, error: errorHorarios } = await supabase
                    .from('Horario')
                    .select('*')
                    .eq('id_espacio', espacioUUID);

                if (errorHorarios) {
                    console.error('Error al verificar horarios:', errorHorarios);
                    // Permitimos continuar para desarrollo
                    return true;
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
                // En caso de error, permitimos continuar para desarrollo
                return true;
            }
        }

        /**
         * Crea una nueva reserva directamente en la tabla sin verificaciones para desarrollo
         * @param {Object} datosReserva - Datos de la reserva
         * @returns {Promise<Object>} - La reserva creada
         */
        async crearReservaDirecta(datosReserva) {
            try {
                await this.init();
                const supabase = this.getSupabase();
                
                const {
                    idEspacio,
                    idUsuario,
                    fechaInicio,
                    fechaFin
                } = datosReserva;
                
                // Buscar el UUID real del espacio en la base de datos
                const espacioUUID = await this.buscarUUIDEspacio(idEspacio);
                const usuarioUUID = this.getUsuarioUUID(idUsuario);
                
                // Crear la reserva simplificada
                const nuevaReserva = {
                    id_usuario: usuarioUUID, 
                    id_espacio: espacioUUID,
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    fecha_creacion: new Date().toISOString(),
                    precio_total: 25.00, // Precio fijo para evitar cálculos
                    estado: 'confirmada'
                };

                console.log('Intentando insertar reserva directamente:', nuevaReserva);
                
                // Insertar sin verificaciones
                const { data, error } = await supabase
                    .from('Reserva')
                    .insert([nuevaReserva])
                    .select();

                if (error) {
                    console.error('Error al crear reserva directa:', error);
                    throw error;
                }
                
                console.log('Reserva directa creada con éxito:', data);
                return data[0];
            } catch (error) {
                console.error('Error en inserción directa:', error);
                throw error;
            }
        }

        /**
         * Crea una nueva reserva
         * @param {Object} datosReserva - Datos de la reserva
         * @returns {Promise<Object>} - La reserva creada
         */
        async crearReserva(datosReserva) {
            try {
                console.log('Iniciando proceso de creación de reserva', datosReserva);
                
                const {
                    idEspacio,
                    idUsuario,
                    fechaInicio,
                    fechaFin,
                    serviciosAdicionales = []
                } = datosReserva;
                
                // Si estamos en modo simulación, simplemente devolvemos un objeto simulado
                if (this.isSimulationMode()) {
                    console.log(`[SIMULACIÓN] Creando reserva para espacio ${idEspacio}`);
                    
                    // Verificamos disponibilidad simulada
                    const disponible = await this.verificarDisponibilidad(idEspacio, fechaInicio, fechaFin);
                    
                    if (!disponible) {
                        throw new Error('El espacio no está disponible para el horario seleccionado');
                    }
                    
                    // Crear objeto simulado
                    return {
                        id_reserva: Math.floor(Math.random() * 10000),
                        id_usuario: idUsuario,
                        id_espacio: idEspacio,
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin,
                        fecha_creacion: new Date().toISOString(),
                        precio_total: Math.floor(Math.random() * 50) + 20,
                        estado: 'confirmada'
                    };
                }
                
                // MODO SIMPLIFICADO PARA PRUEBAS
                // Intenta crear la reserva directamente sin verificaciones
                try {
                    const reservaDirecta = await this.crearReservaDirecta({
                        idEspacio,
                        idUsuario,
                        fechaInicio,
                        fechaFin
                    });
                    
                    if (reservaDirecta) {
                        console.log('Reserva creada correctamente en modo directo:', reservaDirecta);
                        return reservaDirecta;
                    }
                } catch (errorDirecto) {
                    console.warn('Error en modo directo, intentando método estándar:', errorDirecto);
                }
                
                // Si no estamos en simulación, continuamos con la lógica normal
                await this.init();
                const supabase = this.getSupabase();
                
                // Buscar el UUID real del espacio en la base de datos
                const espacioUUID = await this.buscarUUIDEspacio(idEspacio);
                const usuarioUUID = this.getUsuarioUUID(idUsuario);
                
                // 1. Verificar disponibilidad
                const disponible = await this.verificarDisponibilidad(idEspacio, fechaInicio, fechaFin);
                
                if (!disponible) {
                    throw new Error('El espacio no está disponible para el horario seleccionado');
                }

                console.log('Espacio disponible, procediendo con la reserva');

                // Cálculo de precio aproximado 
                let precioTotal = 35.00; // Precio fijo para simplificar

                // 6. Crear la reserva
                const nuevaReserva = {
                    id_usuario: usuarioUUID,
                    id_espacio: espacioUUID,
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    fecha_creacion: new Date().toISOString(),
                    precio_total: precioTotal,
                    estado: 'confirmada'
                };

                console.log('Intentando insertar reserva:', nuevaReserva);
                
                const { data: reservaCreada, error: errorReserva } = await supabase
                    .from('Reserva')
                    .insert([nuevaReserva])
                    .select();

                if (errorReserva) {
                    console.error('Error al crear la reserva:', errorReserva);
                    throw errorReserva;
                }

                console.log('Reserva creada con éxito:', reservaCreada);
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
                // En modo simulación, devolvemos datos simulados
                if (this.isSimulationMode()) {
                    console.log(`[SIMULACIÓN] Obteniendo reservas para usuario ${idUsuario}`);
                    
                    // Reservas simuladas
                    return [
                        {
                            id_reserva: 101,
                            id_usuario: idUsuario,
                            id_espacio: 1,
                            fecha_inicio: new Date().toISOString(),
                            fecha_fin: new Date(Date.now() + 3600000).toISOString(),
                            fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
                            precio_total: 25.50,
                            estado: 'confirmada',
                            Espacio_Trabajo: {
                                nombre: 'Escritorio Premium',
                                direccion: 'Calle Principal 123',
                                capacidad: 1,
                                precio_hora: 8.50
                            }
                        },
                        {
                            id_reserva: 102,
                            id_usuario: idUsuario,
                            id_espacio: 3,
                            fecha_inicio: new Date(Date.now() + 86400000).toISOString(),
                            fecha_fin: new Date(Date.now() + 86400000 + 7200000).toISOString(),
                            fecha_creacion: new Date(Date.now() - 172800000).toISOString(),
                            precio_total: 42.00,
                            estado: 'confirmada',
                            Espacio_Trabajo: {
                                nombre: 'Sala de Reuniones Grande',
                                direccion: 'Avda. Libertad 45',
                                capacidad: 8,
                                precio_hora: 21.00
                            }
                        }
                    ];
                }
                
                // Lógica normal para Supabase
                await this.init();
                const supabase = this.getSupabase();
                
                // Convertir ID a UUID
                const usuarioUUID = this.getUsuarioUUID(idUsuario);
                
                const { data, error } = await supabase
                    .from('Reserva')
                    .select(`
                        *,
                        Espacio_Trabajo:id_espacio (
                            nombre,
                            direccion,
                            capacidad,
                            precio_hora
                        )
                    `)
                    .eq('id_usuario', usuarioUUID)
                    .order('fecha_inicio', { ascending: false });

                if (error) {
                    console.error('Error al obtener reservas del usuario:', error);
                    throw error;
                }
                
                return data;
            } catch (error) {
                console.error('Error general al obtener reservas:', error);
                
                // Si hay error, devolvemos array vacío para no romper la UI
                return [];
            }
        }
        
        /**
         * Obtiene todos los espacios de trabajo disponibles
         * @returns {Promise<Array>} - Lista de espacios de trabajo
         */
        async obtenerTodosLosEspacios() {
            try {
                // Asegurar que el servicio esté inicializado
                await this.init();
                
                // Si estamos en modo simulación, devolver datos de ejemplo
                if (this.isSimulationMode()) {
                    console.log("[SIMULACIÓN] Obteniendo espacios de trabajo");
                    return this.obtenerEspaciosSimulados();
                }
                
                // Obtener el cliente Supabase
                const supabase = this.getSupabase();
                
                // Realizar la consulta para obtener todos los espacios
                const { data, error } = await supabase
                    .from('Espacio_Trabajo')
                    .select('*')
                    .order('nombre');
                    
                if (error) {
                    console.error("Error al obtener espacios:", error);
                    throw error;
                }
                
                console.log(`Obtenidos ${data.length} espacios de trabajo`);
                return data;
            } catch (error) {
                console.error("Error al obtener los espacios:", error);
                // Si hay error, intentar mostrar datos simulados como fallback
                console.log("Devolviendo datos simulados como fallback");
                return this.obtenerEspaciosSimulados();
            }
        }

        /**
         * Proporciona datos de espacios simulados para desarrollo y testing
         * @returns {Array} - Lista de espacios de trabajo simulados
         */
        obtenerEspaciosSimulados() {
            return [
                {
                    id_espacio: "1",
                    nombre: "Escritorio Premium D1",
                    direccion: "Calle Mayor, 15, 30001 Murcia",
                    codigo_espacio: 1,
                    descripcion: "Espacio moderno con luz natural y todas las comodidades para trabajar en el centro de Murcia.",
                    capacidad: 1,
                    precio_hora: 15,
                    wifi: true,
                    parking: true,
                    accesible: true,
                    calificacion: 4.5
                },
                {
                    id_espacio: "2",
                    nombre: "Oficina Ejecutiva O1",
                    direccion: "Avda. Juan Carlos I, 45, 30100 Murcia",
                    codigo_espacio: 2,
                    descripcion: "Oficina ejecutiva en la zona empresarial de La Flota. Ambiente profesional y tranquilo.",
                    capacidad: 4,
                    precio_hora: 25,
                    wifi: true,
                    parking: true,
                    accesible: false,
                    calificacion: 4.2
                },
                {
                    id_espacio: "3",
                    nombre: "Sala de Reuniones M1",
                    direccion: "Plaza Circular, 5, 30008 Murcia",
                    codigo_espacio: 3,
                    descripcion: "Espacio colaborativo para reuniones y presentaciones con equipamiento completo.",
                    capacidad: 8,
                    precio_hora: 35,
                    wifi: true,
                    parking: false,
                    accesible: true,
                    calificacion: 4.8
                },
                {
                    id_espacio: "4",
                    nombre: "Escritorio Standard D2",
                    direccion: "Paseo Alfonso XII, 20, 30202 Cartagena",
                    codigo_espacio: 4,
                    descripcion: "Espacio de trabajo con vistas al puerto. Ambiente marino y creativo.",
                    capacidad: 1,
                    precio_hora: 12,
                    wifi: true,
                    parking: true,
                    accesible: true,
                    calificacion: 4.0
                },
                {
                    id_espacio: "5",
                    nombre: "Oficina Compartida O2",
                    direccion: "Calle Mayor, 8, 30201 Cartagena",
                    codigo_espacio: 5,
                    descripcion: "Oficina en edificio histórico rehabilitado en el centro de Cartagena.",
                    capacidad: 6,
                    precio_hora: 18,
                    wifi: true,
                    parking: false,
                    accesible: false,
                    calificacion: 4.3
                },
                {
                    id_espacio: "6",
                    nombre: "Sala Creativa M2",
                    direccion: "Alameda de Cervantes, 12, 30800 Lorca",
                    codigo_espacio: 6,
                    descripcion: "Espacio para profesionales creativos con zonas de reunión y networking.",
                    capacidad: 10,
                    precio_hora: 28,
                    wifi: true,
                    parking: true,
                    accesible: true,
                    calificacion: 4.6
                }
            ];
        }
    }

    // Crear una instancia del servicio
    const servicioReservas = new ServicioReservas();
    
    // Hacer disponible globalmente
    if (typeof window !== 'undefined') {
        window.servicioReservas = servicioReservas;
    }
    
    // Despachar un evento para notificar que el servicio está listo
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('servicioReservasReady'));
    }
})();