/**
 * CoWorkGo - Script de Reservas
 * Gestiona la funcionalidad para reservar espacios de trabajo
 */

document.addEventListener('DOMContentLoaded', () => {
    // Variables globales (IMPORTANTE - Estaban faltando estas declaraciones)
    window.selectedDesks = new Set();
    window.selectedOffices = new Set();
    window.selectedMeetingRooms = new Set();
    window.selectedServices = new Set();
    
    let selectedDate = null;
    let selectedStartTime = null;
    let selectedEndTime = null;

    // Array con los IDs de los espacios ocupados (simulación de backend)
    const occupiedSpaces = {
        desk: ['D3', 'D7', 'D12', 'D15', 'D19'], 
        office: ['O2', 'O5', 'O9', 'O13', 'O16'],
        meeting: ['M2', 'M5', 'M7', 'M9']
    };

    // Referencias a elementos DOM
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

    // Verificar todos los elementos críticos
    if (!workspaceTypeSegment) console.error('Elemento workspaceType no encontrado');
    if (!floorPlan) console.error('Elemento floorPlan no encontrado');
    if (!bookingDateInput) console.error('Elemento bookingDate no encontrado');
    if (!startTimeSelect) console.error('Elemento startTime no encontrado');
    if (!endTimeSelect) console.error('Elemento endTime no encontrado');

    // INICIALIZACIÓN DE LA PÁGINA
    console.log('Inicializando página de reservas...');

    // Setup date picker - Configurar la fecha
    setupDateInput();
    
    // Setup time selectors - Configurar selectores de tiempo
    generateTimeOptions(startTimeSelect, 7, 23);
    
    // Setup service checkboxes - Manejar servicios adicionales
    setupServiceCheckboxes();

    // Cargar workspace por defecto
    generateWorkspaces('desk');

    // ASIGNAR EVENT LISTENERS
    
    // Cambiar tipo de espacio
    if (workspaceTypeSegment) {
        workspaceTypeSegment.addEventListener('ionChange', (ev) => {
            console.log('Cambiando tipo de espacio a:', ev.detail.value);
            
            // Reset selecciones previas
            window.selectedDesks.clear();
            window.selectedOffices.clear();
            window.selectedMeetingRooms.clear();
            
            // Generar nuevos espacios
            generateWorkspaces(ev.detail.value);
            
            // Actualizar UI
            updateConfirmButton();
        });
    }

    // Cambio de fecha
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

    // Hora inicio
    if (startTimeSelect) {
        startTimeSelect.addEventListener('ionChange', (ev) => {
            selectedStartTime = ev.detail.value;
            console.log('Hora inicio seleccionada:', selectedStartTime);
            updateAvailableEndTimes();
            updateTimeRange();
        });
    }

    // Hora fin
    if (endTimeSelect) {
        endTimeSelect.addEventListener('ionChange', (ev) => {
            selectedEndTime = ev.detail.value;
            console.log('Hora fin seleccionada:', selectedEndTime);
            calculateDuration();
            updateTimeRange();
        });
    }

    // Botón confirmar
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            // Crear resumen de la reserva
            const workspaces = [
                ...Array.from(window.selectedDesks),
                ...Array.from(window.selectedOffices),
                ...Array.from(window.selectedMeetingRooms)
            ].filter(Boolean);
            
            const booking = {
                workspaces: workspaces,
                date: selectedDate,
                startTime: selectedStartTime,
                endTime: selectedEndTime,
                duration: totalDurationSpan ? totalDurationSpan.textContent : '0 horas',
                services: Array.from(window.selectedServices)
            };

            updateBookingSummary(booking);
            if (bookingSummary) {
                bookingSummary.style.display = 'block';
            }
        });
    }

    // Guardar reserva
    // Guardar reserva
const saveBookingButton = document.getElementById('saveBooking');   
if (saveBookingButton) {
    saveBookingButton.addEventListener('click', async () => {
        try {
            showLoading('Guardando reserva...');

            // Obtener datos relevantes
            const idUsuario = sessionStorage.getItem('userId') || '62487baf-f156-4395-b988-d5a66dcc1126'; 
            
            // Obtener espacios seleccionados
            const workspaces = [
                ...Array.from(window.selectedDesks),
                ...Array.from(window.selectedOffices),
                ...Array.from(window.selectedMeetingRooms)
            ].filter(Boolean);
            
            if (workspaces.length === 0) {
                throw new Error('Debe seleccionar al menos un espacio');
            }
            
            // Usar el primer espacio para la reserva
            const espacioCompleto = workspaces[0];
            // MODIFICACIÓN IMPORTANTE: Pasar el ID completo incluyendo la letra
            // para identificar el tipo de espacio (D2, O3, M1, etc.)
            const idEspacio = espacioCompleto; 
            
            console.log(`Creando reserva para espacio ${idEspacio}`);
            
            // Construir fechas ISO
            const fechaISO = selectedDate;
            const fechaInicio = `${fechaISO}T${selectedStartTime}:00`;
            const fechaFin = `${fechaISO}T${selectedEndTime}:00`;
            
            // Recopilar servicios
            const serviciosIds = Array.from(window.selectedServices).map(servicio => {
                const mapeoServicios = {
                    'wifi': 1, 'parking': 2, 'coffee': 3, 'water': 4,
                    'projector': 5, 'printer': 6, 'videoconf': 7,
                    'wifi_meeting': 1, 'coffee_meeting': 3, 
                    'water_meeting': 4, 'projector_meeting': 5
                };
                return mapeoServicios[servicio] || null;
            }).filter(Boolean);
            
            let reservaGuardada = false;
            
            // Intentar guardar en base de datos
            if (window.servicioReservas) {
                try {
                    const resultado = await window.servicioReservas.crearReserva({
                        idEspacio,
                        idUsuario,
                        fechaInicio,
                        fechaFin,
                        serviciosAdicionales: serviciosIds
                    });
                    
                    console.log('Reserva guardada en Supabase:', resultado);
                    reservaGuardada = true;
                } catch (error) {
                    console.error('Error con Supabase, usando almacenamiento local:', error);
                }
            } else {
                console.warn('API no disponible, usando almacenamiento local');
            }
            
            // Reserva local como respaldo
            if (!reservaGuardada) {
                console.log('Guardando en localStorage como respaldo');
                const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                reservations.push({
                    workspaces,
                    date: selectedDate,
                    startTime: selectedStartTime,
                    endTime: selectedEndTime,
                    duration: totalDurationSpan ? totalDurationSpan.textContent : '0 horas',
                    services: Array.from(window.selectedServices)
                });
                localStorage.setItem('reservations', JSON.stringify(reservations));
            }

            hideLoading();
            
            // Éxito!
            showToast('¡Reserva guardada con éxito!', 'success');
            
            // // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = '/web/pantalla_Inicio/inicio.html';
            }, 2000);
            
        } catch (error) {
            hideLoading();
            showToast(`Error: ${error.message}`, 'danger');
            console.error('Error al guardar reserva:', error);
        }
    });
}

    // Modificar reserva
    const modifyBookingButton = document.getElementById('modifyBooking');
    if (modifyBookingButton) {
        modifyBookingButton.addEventListener('click', () => {
            if (bookingSummary) {
                bookingSummary.style.display = 'none';
            }
        });
    }
    
    // Configurar servicio supabase
    console.log('Verificando disponibilidad del servicio de reservas...');
    if (window.servicioReservas) {
        console.log('Servicio de reservas existente encontrado');
    } else {
        console.log('Cargando servicio de reservas dinamicamente...');
        const script = document.createElement('script');
        script.src = '/web/menus/reservas-service.js';
        document.head.appendChild(script);
    }

    // FUNCIONES DE UTILIDAD

    // Generación de espacios
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

    // Handler para selección de escritorios
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
            window.selectedDesks.add(deskId);
        } else {
            window.selectedDesks.delete(deskId);
        }

        // Actualizar UI
        updateSelectionSummary('desk');
        updateConfirmButton();
    }

    // Handler para selección de oficinas
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
            window.selectedOffices.add(officeId);
        } else {
            window.selectedOffices.delete(officeId);
        }

        // Actualizar UI
        updateSelectionSummary('office');
        updateConfirmButton();
    }

    // Handler para selección de salas
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
        window.selectedMeetingRooms.clear();
        if (this.classList.contains('selected')) {
            window.selectedMeetingRooms.add(roomId);
        }

        // Actualizar UI
        updateSelectionSummary('meeting');
        updateConfirmButton();
    }

    // Actualización del resumen de selección
    function updateSelectionSummary(type = 'desk') {
        if (!selectionSummary || !selectedCount || !selectedDesksElement) {
            return;
        }

        let items, tagClass;
        
        if (type === 'desk') {
            items = window.selectedDesks;
            tagClass = 'desk-tag';
        } else if (type === 'office') {
            items = window.selectedOffices;
            tagClass = 'office-tag';
        } else if (type === 'meeting') {
            items = window.selectedMeetingRooms;
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

    // Actualizar horas disponibles para fin
    function updateAvailableEndTimes() {
        if (!endTimeSelect || !selectedStartTime) return;
        
        endTimeSelect.innerHTML = '';
        
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

    // Actualizar rango de tiempo en UI
    function updateTimeRange() {
        if (!selectedStartTime || !selectedEndTime || !timeRangeSpan) return;
        
        timeRangeSpan.textContent = `${selectedStartTime} a ${selectedEndTime}`;
        
        // Esto también actualiza la duración
        calculateDuration();
    }

    // Actualizar estado del botón de confirmación
    function updateConfirmButton() {
        if (!confirmButton) return;
        
        const hasSelections = 
            window.selectedDesks.size > 0 || 
            window.selectedOffices.size > 0 || 
            window.selectedMeetingRooms.size > 0;
                             
        confirmButton.disabled = !hasSelections || !selectedDate || !selectedStartTime || !selectedEndTime;
    }

    // Actualizar resumen de reserva
    function updateBookingSummary(booking) {
        if (!summaryContent) return;
        
        // Determinar tipo de espacio y crear descripción
        let workspaceDescription = '';
        
        if (window.selectedDesks.size > 0) {
            workspaceDescription = `Escritorio${window.selectedDesks.size > 1 ? 's' : ''}: ${Array.from(window.selectedDesks).join(', ')}`;
        } else if (window.selectedOffices.size > 0) {
            workspaceDescription = `Oficina${window.selectedOffices.size > 1 ? 's' : ''}: ${Array.from(window.selectedOffices).join(', ')}`;
        } else if (window.selectedMeetingRooms.size > 0) {
            workspaceDescription = `Sala${window.selectedMeetingRooms.size > 1 ? 's' : ''} de Reuniones: ${Array.from(window.selectedMeetingRooms).join(', ')}`;
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
                ${window.selectedServices.size > 0 ? `
                    <div class="services-summary">
                        <h4>Servicios adicionales:</h4>
                        ${Array.from(window.selectedServices).map(service => `
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

    // Configurar servicios adicionales
    function setupServiceCheckboxes() {
        document.querySelectorAll('.service-item ion-checkbox').forEach(checkbox => {
            checkbox.addEventListener('ionChange', (ev) => {
                const isChecked = ev.detail.checked;
                const serviceValue = ev.target.value;
                
                if (isChecked) {
                    window.selectedServices.add(serviceValue);
                    console.log('Servicio seleccionado:', serviceValue);
                } else {
                    window.selectedServices.delete(serviceValue);
                    console.log('Servicio deseleccionado:', serviceValue);
                }
            });
        });
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

    // Generar opciones de hora para los selectores
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

    // Mostrar indicador de carga
    async function showLoading(message = 'Cargando...') {
        const loading = document.createElement('ion-loading');
        loading.message = message;
        loading.id = 'loading-indicator';
        document.body.appendChild(loading);
        await loading.present();
    }

    // Ocultar indicador de carga
    async function hideLoading() {
        const loading = document.getElementById('loading-indicator');
        if (loading) {
            await loading.dismiss();
            loading.remove();
        }
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
});