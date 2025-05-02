document.addEventListener('DOMContentLoaded', () => {
    // Variables globales (igual que el original)
    let selectedWorkspace = null;
    let selectedTime = null;
    let selectedDate = null;
    let selectedStartTime = null;
    let selectedEndTime = null;
    let selectedDuration = null;
    let selectedDesks = new Set();
    let selectedOffices = new Set();
    let selectedMeetingRooms = new Set();
    let selectedServices = new Set();

    // Array con los IDs de los espacios ocupados (mantenemos los mismos datos)
    const occupiedSpaces = {
        desk: ['D3', 'D7', 'D12', 'D15', 'D19'], // Ajustado para 21 escritorios
        office: ['O2', 'O5', 'O9', 'O13', 'O16'], // Oficinas ocupadas
        meeting: ['M2', 'M5', 'M7', 'M9'] // Salas de reuniones ocupadas
    };

    // Elementos DOM (usando los mismos IDs del original)
    const workspaceTypeSegment = document.getElementById('workspaceType');
    const floorPlan = document.getElementById('floorPlan');
    const bookingDateInput = document.getElementById('bookingDate');
    const confirmButton = document.getElementById('confirmBooking');
    const bookingSummary = document.getElementById('bookingSummary');
    const summaryContent = document.getElementById('summaryContent');
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');
    const timeRangeSpan = document.getElementById('timeRange');
    const totalDurationSpan = document.getElementById('totalDuration');
    const deskServices = document.getElementById('deskServices');
    const officeServices = document.getElementById('officeServices');
    const meetingServices = document.getElementById('meetingServices');
    const selectionSummary = document.getElementById('selectionSummary');
    const selectedCount = document.getElementById('selectedCount');
    const selectedDesksElement = document.getElementById('selectedDesks');

    // CORRECCIÓN 1: Asegurar que tenemos el event listener para cambio de tipo de espacio
    if (workspaceTypeSegment) {
        workspaceTypeSegment.addEventListener('ionChange', (ev) => {
            console.log('Cambiando tipo de espacio a:', ev.detail.value);
            
            // Limpiar selecciones previas
            selectedDesks.clear();
            selectedOffices.clear();
            selectedMeetingRooms.clear();
            
            // Generar la vista correcta
            generateWorkspaces(ev.detail.value);
            
            // Actualizar UI
            updateConfirmButton();
        });
    } else {
        console.error('No se encontró el elemento workspaceType');
    }

    // Configurar botón de volver
    const backButton = document.querySelector('ion-back-button');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Verificar cambios sin guardar
            if (hasUnsavedChanges()) {
                showConfirmationDialog();
            } else {
                navigateBack();
            }
        });
    }

    // CORRECCIÓN 2: Asegurar los handlers para los inputs de fecha/hora
    if (bookingDateInput) {
        bookingDateInput.addEventListener('ionChange', (ev) => {
            const selectedDateObj = new Date(ev.detail.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDateObj < today) {
                showToast('No puedes seleccionar una fecha pasada', 'danger');
                bookingDateInput.value = today.toISOString().split('T')[0];
                selectedDate = bookingDateInput.value;
            } else {
                selectedDate = ev.detail.value;
            }
            
            console.log('Fecha seleccionada:', selectedDate);
            updateConfirmButton();
        });
    }

    if (startTimeSelect) {
        startTimeSelect.addEventListener('ionChange', (ev) => {
            selectedStartTime = ev.detail.value;
            console.log('Hora inicio seleccionada:', selectedStartTime);
            updateAvailableEndTimes();
            updateTimeRange();
        });
    }

    if (endTimeSelect) {
        endTimeSelect.addEventListener('ionChange', (ev) => {
            selectedEndTime = ev.detail.value;
            console.log('Hora fin seleccionada:', selectedEndTime);
            calculateDuration();
            updateTimeRange();
        });
    }

    // CORRECCIÓN 3: Asegurar los handlers para botones de confirmar/guardar
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            const booking = {
                workspaces: [
                    ...Array.from(selectedDesks),
                    ...Array.from(selectedOffices),
                    ...Array.from(selectedMeetingRooms)
                ].filter(Boolean),
                date: selectedDate,
                startTime: selectedStartTime,
                endTime: selectedEndTime,
                duration: totalDurationSpan ? totalDurationSpan.textContent : '0 horas',
                services: Array.from(selectedServices)
            };

            updateBookingSummary(booking);
            if (bookingSummary) {
                bookingSummary.style.display = 'block';
            }
        });
    }

    // Configurar "Guardar Reserva"
    // Configurar "Guardar Reserva"
    const saveBookingButton = document.getElementById('saveBooking');   
    if (saveBookingButton) {
        saveBookingButton.addEventListener('click', async () => {
        try {
            // Mostrar indicador de carga
            const loading = document.createElement('ion-loading');
            loading.message = 'Guardando reserva...';
            document.body.appendChild(loading);
            await loading.present();

            // Obtener datos de la reserva
            const idUsuario = sessionStorage.getItem('userId') || '1'; // Valor predeterminado para demo
            
            // Obtener espacios seleccionados
            const workspaces = [
                ...Array.from(selectedDesks),
                ...Array.from(selectedOffices),
                ...Array.from(selectedMeetingRooms)
            ].filter(Boolean);
            
            if (workspaces.length === 0) {
                throw new Error('Debe seleccionar al menos un espacio');
            }
            
            // Usar el primer espacio seleccionado para la reserva en Supabase
            const espacioCompleto = workspaces[0];
            const tipoEspacio = espacioCompleto[0]; // Primera letra: D, O o M
            const idEspacio = espacioCompleto.substring(1); // Número después de la letra
            
            console.log(`Creando reserva para espacio tipo ${tipoEspacio} id ${idEspacio}`);
            
            // Construir fechas ISO para Supabase
            const fechaISO = selectedDate;
            const fechaInicio = `${fechaISO}T${selectedStartTime}:00`;
            const fechaFin = `${fechaISO}T${selectedEndTime}:00`;
            
            // Recopilar servicios adicionales seleccionados
            const serviciosIds = Array.from(selectedServices).map(servicio => {
                // Mapeo simple de servicios para la demo
                const mapeoServicios = {
                    'wifi': 1,
                    'parking': 2,
                    'coffee': 3,
                    'water': 4,
                    'projector': 5,
                    'printer': 6,
                    'videoconf': 7,
                    'wifi_meeting': 1,
                    'coffee_meeting': 3,
                    'water_meeting': 4,
                    'projector_meeting': 5
                };
                return mapeoServicios[servicio] || null;
            }).filter(Boolean);
            
            let reservaGuardada = false;
            
            // PASO 1: Intentar guardar en Supabase usando el servicio
            try {
                // Importar el servicio si está disponible
                let servicioReservas;
                try {
                    servicioReservas = (await import('../conexion/services/reservas-service.js')).servicioReservas;
                } catch (importError) {
                    console.warn('No se pudo importar el servicio de reservas:', importError);
                }
                
                // Verificar si existe el servicio
                if (servicioReservas && typeof servicioReservas.crearReserva === 'function') {
                    
                    const resultado = await servicioReservas.crearReserva({
                        idEspacio,
                        idUsuario,
                        fechaInicio,
                        fechaFin,
                        serviciosAdicionales: serviciosIds
                    });
                    
                    console.log('Reserva guardada en Supabase:', resultado);
                    reservaGuardada = true;
                } else {
                    console.warn('Servicio de reservas no disponible, usando almacenamiento local');
                }
            } catch (supabaseError) {
                console.error('Error al guardar en Supabase:', supabaseError);
                console.log('Continuando con almacenamiento local');
            }
            
            // PASO 2: Si falla Supabase, usar almacenamiento local como respaldo
            if (!reservaGuardada) {
                console.log('Guardando en localStorage como respaldo');
                const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                reservations.push({
                    workspaces,
                    date: selectedDate,
                    startTime: selectedStartTime,
                    endTime: selectedEndTime,
                    duration: totalDurationSpan ? totalDurationSpan.textContent : '0 horas',
                    services: Array.from(selectedServices)
                });
                localStorage.setItem('reservations', JSON.stringify(reservations));
            }

            // Cerrar indicador de carga
            await loading.dismiss();
            
            // Mostrar mensaje de éxito
            const toast = document.createElement('ion-toast');
            toast.message = '¡Reserva guardada con éxito!';
            toast.duration = 2000;
            toast.position = 'top';
            toast.color = 'success';
            document.body.appendChild(toast);
            await toast.present();

            // Redirigir a inicio después de 2 segundos
            setTimeout(() => {
                window.location.href = '/web/pantalla_Inicio/inicio.html';
            }, 2000);
            
        } catch (error) {
            // Cerrar loading si está activo
            const loadingElement = document.querySelector('ion-loading');
            if (loadingElement) {
                await loadingElement.dismiss();
            }
            
            // Mostrar mensaje de error
            const toast = document.createElement('ion-toast');
            toast.message = `Error: ${error.message}`;
            toast.duration = 3000;
            toast.position = 'top';
            toast.color = 'danger';
            document.body.appendChild(toast);
            await toast.present();
            console.error('Error al guardar la reserva:', error);
        }
     });
    }

    // Configurar "Modificar Reserva"
    const modifyBookingButton = document.getElementById('modifyBooking');
    if (modifyBookingButton) {
        modifyBookingButton.addEventListener('click', () => {
            if (bookingSummary) {
                bookingSummary.style.display = 'none';
            }
        });
    }

    // Configurar servicios adicionales
    document.querySelectorAll('.service-item ion-checkbox').forEach(checkbox => {
        checkbox.addEventListener('ionChange', (ev) => {
            const service = ev.detail.checked;
            const serviceValue = ev.target.value;
            
            if (service) {
                selectedServices.add(serviceValue);
                console.log('Servicio seleccionado:', serviceValue);
            } else {
                selectedServices.delete(serviceValue);
                console.log('Servicio deseleccionado:', serviceValue);
            }
        });
    });

    // CORRECCIÓN 4: Funciones clave actualizadas
    // Verificar cambios sin guardar
    function hasUnsavedChanges() {
        return selectedDesks.size > 0 || 
               selectedOffices.size > 0 || 
               selectedMeetingRooms.size > 0 || 
               selectedServices.size > 0 ||
               selectedDate !== null ||
               selectedStartTime !== null ||
               selectedEndTime !== null;
    }

    // Mostrar diálogo de confirmación
    function showConfirmationDialog() {
        const alert = document.createElement('ion-alert');
        alert.header = 'Cambios sin guardar';
        alert.message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
        alert.buttons = [
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    console.log('Operación cancelada');
                }
            },
            {
                text: 'Salir',
                handler: () => {
                    navigateBack();
                }
            }
        ];

        document.body.appendChild(alert);
        alert.present();
    }

    // Navegar hacia atrás
    function navigateBack() {
        window.location.href = '/web/pantalla_Inicio/inicio.html';
    }

    // CORRECCIÓN 5: Este es el método clave que necesita arreglarse
    function generateWorkspaces(type) {
        console.log('Generando espacios de tipo:', type);
        
        if (!floorPlan) {
            console.error('No se encontró el elemento floorPlan');
            return;
        }
        
        // Limpiar el contenedor
        floorPlan.innerHTML = '';
        
        // Ocultar todos los menús de servicios
        if (deskServices) deskServices.style.display = 'none';
        if (officeServices) officeServices.style.display = 'none';
        if (meetingServices) meetingServices.style.display = 'none';
        
        // Ocultar resumen de selección
        if (selectionSummary) {
            selectionSummary.style.display = 'none';
        }

        if (type === 'desk') {
            // Generar grid de escritorios
            const deskGrid = document.createElement('div');
            deskGrid.className = 'desk-grid';
            
            // Generar 21 escritorios (7 filas x 3 columnas)
            for (let i = 1; i <= 21; i++) {
                const desk = document.createElement('div');
                desk.className = 'workspace-item';
                const deskId = `D${i}`;
                desk.dataset.id = deskId;
                
                desk.innerHTML = `
                    <ion-icon name="desktop-outline"></ion-icon>
                    <p>Escritorio ${i}</p>
                `;

                // Verificar si el escritorio está ocupado
                if (occupiedSpaces.desk.includes(deskId)) {
                    desk.classList.add('occupied');
                } else {
                    // AQUÍ ESTÁ LA CLAVE: Agregar el event listener correcto
                    desk.addEventListener('click', handleDeskSelection);
                }
                
                deskGrid.appendChild(desk);
            }
            
            floorPlan.appendChild(deskGrid);
            
            // Mostrar servicios para escritorios
            if (deskServices) deskServices.style.display = 'block';
            
        } else if (type === 'office') {
            // Generar grid de oficinas
            const officeGrid = document.createElement('div');
            officeGrid.className = 'office-grid';
            
            // Generar 16 oficinas (4x4)
            for (let i = 1; i <= 16; i++) {
                const office = document.createElement('div');
                office.className = 'workspace-item';
                const officeId = `O${i}`;
                office.dataset.id = officeId;
                
                office.innerHTML = `
                    <ion-icon name="business-outline"></ion-icon>
                    <p>Oficina ${i}</p>
                    <small>Capacidad: ${i % 2 === 0 ? '6' : '4'} personas</small>
                `;

                // Verificar si la oficina está ocupada
                if (occupiedSpaces.office.includes(officeId)) {
                    office.classList.add('occupied');
                } else {
                    // AQUÍ ESTÁ LA CLAVE: Agregar el event listener correcto
                    office.addEventListener('click', handleOfficeSelection);
                }
                
                officeGrid.appendChild(office);
            }
            
            floorPlan.appendChild(officeGrid);
            
            // Mostrar servicios para oficinas
            if (officeServices) officeServices.style.display = 'block';
            
        } else if (type === 'meeting') {
            // Generar grid de salas de reuniones
            const meetingGrid = document.createElement('div');
            meetingGrid.className = 'meeting-grid';
            
            // Generar 10 salas de reuniones
            for (let i = 1; i <= 10; i++) {
                const room = document.createElement('div');
                room.className = 'meeting-room';
                const roomId = `M${i}`;
                room.dataset.id = roomId;
                
                // Asignar características según el número de sala
                const capacity = i <= 5 ? 8 : 12;
                const hasVideoConf = i % 2 === 0;
                const hasCoffee = i > 7;
                
                room.innerHTML = `
                    <ion-icon name="people-outline" class="room-icon"></ion-icon>
                    <div class="meeting-room-title">Sala de Reuniones ${i}</div>
                    <div class="meeting-room-capacity">Capacidad: ${capacity} personas</div>
                    <div class="meeting-room-features">
                        <ion-icon name="tv-outline" title="Proyector"></ion-icon>
                        ${hasVideoConf ? '<ion-icon name="videocam-outline" title="Videoconferencia"></ion-icon>' : ''}
                        ${hasCoffee ? '<ion-icon name="cafe-outline" title="Servicio de café"></ion-icon>' : ''}
                    </div>
                `;

                // Verificar si la sala está ocupada
                if (occupiedSpaces.meeting.includes(roomId)) {
                    room.classList.add('occupied');
                } else {
                    // AQUÍ ESTÁ LA CLAVE: Agregar el event listener correcto
                    room.addEventListener('click', handleMeetingRoomSelection);
                }
                
                meetingGrid.appendChild(room);
            }
            
            floorPlan.appendChild(meetingGrid);
            
            // Mostrar servicios para salas
            if (meetingServices) meetingServices.style.display = 'block';
        }
    }

    // CORRECCIÓN 6: Handler para selección de escritorios
    function handleDeskSelection() {
        if (this.classList.contains('occupied')) {
            showToast('Este escritorio no está disponible', 'danger');
            return;
        }

        const deskId = this.dataset.id;
        
        // Alternar selección visual
        this.classList.toggle('selected');

        // Actualizar conjunto de escritorios seleccionados
        if (this.classList.contains('selected')) {
            selectedDesks.add(deskId);
        } else {
            selectedDesks.delete(deskId);
        }

        // Actualizar UI
        updateSelectionSummary('desk');
        updateConfirmButton();
    }

    // CORRECCIÓN 7: Handler para selección de oficinas
    function handleOfficeSelection() {
        if (this.classList.contains('occupied')) {
            showToast('Esta oficina no está disponible', 'danger');
            return;
        }

        const officeId = this.dataset.id;
        
        // Alternar selección visual
        this.classList.toggle('selected');

        // Actualizar conjunto de oficinas seleccionadas
        if (this.classList.contains('selected')) {
            selectedOffices.add(officeId);
        } else {
            selectedOffices.delete(officeId);
        }

        // Actualizar UI
        updateSelectionSummary('office');
        updateConfirmButton();
    }

    // CORRECCIÓN 8: Handler para selección de salas
    function handleMeetingRoomSelection() {
        if (this.classList.contains('occupied')) {
            showToast('Esta sala no está disponible', 'danger');
            return;
        }

        // Desseleccionar otras salas (solo una a la vez)
        document.querySelectorAll('.meeting-room').forEach(room => {
            if (room !== this) room.classList.remove('selected');
        });
        
        // Alternar selección visual
        this.classList.toggle('selected');
        
        const roomId = this.dataset.id;

        // Actualizar conjunto de salas seleccionadas
        selectedMeetingRooms.clear();
        if (this.classList.contains('selected')) {
            selectedMeetingRooms.add(roomId);
        }

        // Actualizar UI
        updateSelectionSummary('meeting');
        updateConfirmButton();
    }

    // CORRECCIÓN 9: Actualización del resumen de selección
    function updateSelectionSummary(type = 'desk') {
        if (!selectionSummary || !selectedCount || !selectedDesksElement) {
            return;
        }

        let items, tagClass;
        
        if (type === 'desk') {
            items = selectedDesks;
            tagClass = 'desk-tag';
        } else if (type === 'office') {
            items = selectedOffices;
            tagClass = 'office-tag';
        } else if (type === 'meeting') {
            items = selectedMeetingRooms;
            tagClass = 'desk-tag'; // Usar el mismo estilo para simplificar
        }

        if (items.size > 0) {
            // Actualizar contador
            selectedCount.textContent = items.size;
            
            // Actualizar etiquetas con los elementos seleccionados
            selectedDesksElement.innerHTML = Array.from(items)
                .map(id => `<span class="${tagClass}">${id}</span>`)
                .join('');
            
            // Mostrar el resumen
            selectionSummary.style.display = 'block';
        } else {
            // Ocultar si no hay selección
            selectionSummary.style.display = 'none';
        }
    }

    // CORRECCIÓN 10: Actualización de horas disponibles
    function updateAvailableEndTimes() {
        if (!endTimeSelect) return;
        
        endTimeSelect.innerHTML = '';
        if (!selectedStartTime) return;

        const startHour = parseInt(selectedStartTime.split(':')[0]);
        for (let hour = startHour + 1; hour <= 24; hour++) {
            const timeValue = hour === 24 ? '00:00' : `${hour.toString().padStart(2, '0')}:00`;
            const option = document.createElement('ion-select-option');
            option.value = timeValue;
            option.textContent = timeValue;
            endTimeSelect.appendChild(option);
        }
        
        // Habilitar selector de hora fin
        endTimeSelect.disabled = false;
    }

    // Calcular duración de la reserva
    function calculateDuration() {
        if (!selectedStartTime || !selectedEndTime || !totalDurationSpan) return;
        
        const start = new Date(`2025-01-01 ${selectedStartTime}`);
        let end = new Date(`2025-01-01 ${selectedEndTime}`);
        
        if (selectedEndTime === '00:00') {
            end = new Date(`2025-01-02 00:00`);
        }
        
        const diffHours = (end - start) / (1000 * 60 * 60);
        totalDurationSpan.textContent = `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
        updateConfirmButton();
    }

    // Actualizar rango de tiempo
    function updateTimeRange() {
        if (!selectedStartTime || !selectedEndTime || !timeRangeSpan || !totalDurationSpan) return;
        
        const startTime = new Date(`2025-01-01 ${selectedStartTime}`);
        let endTime = new Date(`2025-01-01 ${selectedEndTime}`);
        
        if (selectedEndTime === '00:00') {
            endTime = new Date(`2025-01-02 00:00`);
        }
        
        const diffHours = (endTime - startTime) / (1000 * 60 * 60);
        
        timeRangeSpan.textContent = `${selectedStartTime} a ${selectedEndTime}`;
        totalDurationSpan.textContent = `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
        
        updateConfirmButton();
    }

    // Actualizar estado del botón de confirmación
    function updateConfirmButton() {
        if (!confirmButton) return;
        
        const hasSelections = selectedDesks.size > 0 || 
                             selectedOffices.size > 0 || 
                             selectedMeetingRooms.size > 0;
                             
        confirmButton.disabled = !hasSelections || !selectedDate || !selectedStartTime || !selectedEndTime;
    }

    // Actualizar resumen de reserva
    function updateBookingSummary(booking) {
        if (!summaryContent) return;
        
        // Determinar tipo de espacio y crear descripción
        let workspaceDescription = '';
        
        if (selectedDesks.size > 0) {
            workspaceDescription = `Escritorio${selectedDesks.size > 1 ? 's' : ''}: ${Array.from(selectedDesks).join(', ')}`;
        } else if (selectedOffices.size > 0) {
            workspaceDescription = `Oficina${selectedOffices.size > 1 ? 's' : ''}: ${Array.from(selectedOffices).join(', ')}`;
        } else if (selectedMeetingRooms.size > 0) {
            workspaceDescription = `Sala${selectedMeetingRooms.size > 1 ? 's' : ''} de Reuniones: ${Array.from(selectedMeetingRooms).join(', ')}`;
        }

        // Formatear fecha para mostrar
        let fechaFormateada = '';
        try {
            fechaFormateada = new Date(selectedDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            fechaFormateada = selectedDate || 'Fecha no seleccionada';
        }

        // Crear HTML del resumen
        summaryContent.innerHTML = `
            <div class="summary-info">
                <p><strong>Espacio:</strong> ${workspaceDescription}</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Horario:</strong> ${selectedStartTime} a ${selectedEndTime}</p>
                <p><strong>Duración:</strong> ${totalDurationSpan ? totalDurationSpan.textContent : '0 horas'}</p>
                ${selectedServices.size > 0 ? `
                    <div class="services-summary">
                        <h4>Servicios adicionales:</h4>
                        ${Array.from(selectedServices).map(service => `
                            <div class="selected-service">
                                <ion-icon name="${getServiceIcon(service)}"></ion-icon>
                                ${getServiceName(service)}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Configurar input de fecha
    function setupDateInput() {
        if (!bookingDateInput) return;
        
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() + 1);

        bookingDateInput.min = today.toISOString().split('T')[0];
        bookingDateInput.max = maxDate.toISOString().split('T')[0];
        
        // Establecer valor por defecto como el día actual
        bookingDateInput.value = today.toISOString().split('T')[0];
        selectedDate = bookingDateInput.value;
    }

    // CORRECCIÓN 11: Generar opciones de hora
    function generateTimeOptions(select, startHour, endHour) {
        if (!select) return;
        
        // Limpiar opciones existentes
        select.innerHTML = '';
        
        for (let hour = startHour; hour <= endHour; hour++) {
            const timeValue = `${hour.toString().padStart(2, '0')}:00`;
            const option = document.createElement('ion-select-option');
            option.value = timeValue;
            option.textContent = timeValue;
            select.appendChild(option);
        }
    }

    // Mostrar mensaje toast
    function showToast(message, color = 'primary') {
        const toast = document.createElement('ion-toast');
        toast.message = message;
        toast.duration = 2000;
        toast.position = 'top';
        toast.color = color;
        document.body.appendChild(toast);
        toast.present();
    }

    // Obtener nombre de servicio
    function getServiceName(service) {
        const serviceNames = {
            wifi: 'WiFi Premium',
            parking: 'Plaza de Parking',
            coffee: 'Cafetera',
            water: 'Dispensador de Agua',
            projector: 'Proyector',
            printer: 'Impresora',
            wifi_meeting: 'WiFi Alta Velocidad',
            coffee_meeting: 'Servicio de Café',
            water_meeting: 'Agua Mineral',
            projector_meeting: 'Proyector Profesional',
            videoconf: 'Videoconferencia'
        };
        return serviceNames[service] || service;
    }

    // Obtener icono de servicio
    function getServiceIcon(service) {
        const serviceIcons = {
            wifi: 'wifi-outline',
            wifi_meeting: 'wifi-outline',
            parking: 'car-outline',
            coffee: 'cafe-outline',
            coffee_meeting: 'cafe-outline',
            water: 'water-outline',
            water_meeting: 'water-outline',
            projector: 'tv-outline',
            projector_meeting: 'tv-outline',
            printer: 'print-outline',
            videoconf: 'videocam-outline'
        };
        return serviceIcons[service] || 'add-outline';
    }

    // INICIALIZACIÓN
    console.log('Inicializando página de reservas...');
    setupDateInput();
    generateTimeOptions(startTimeSelect, 7, 23);
    generateWorkspaces('desk'); // Mostrar escritorios por defecto
});