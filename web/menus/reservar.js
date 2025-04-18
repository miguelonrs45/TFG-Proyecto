document.addEventListener('DOMContentLoaded', () => {
    const workspaceConfig = {
        desk: {
            count: 21, // Cambiado a 21 escritorios
            icon: 'desktop-outline',
            name: 'Escritorio'
        },
        office: {
            count: 16, // Aumentado a 16 oficinas
            icon: 'business-outline',
            name: 'Oficina'
        },
        meeting: {
            count: 4,
            icon: 'people-outline',
            name: 'Sala de Reuniones'
        }
    };

    const timeSlots = [
        '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
        '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
        '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
    ];

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

    // Array con los IDs de los espacios ocupados (fijos)
    const occupiedSpaces = {
        desk: ['D3', 'D7', 'D12', 'D15', 'D19'], // Ajustado para 21 escritorios
        office: ['O2', 'O5', 'O9', 'O13', 'O16'], // Oficinas ocupadas
        meeting: ['M2', 'M5', 'M7', 'M9'] // Salas de reuniones ocupadas
    };

    // Elementos DOM
    const workspaceTypeSegment = document.getElementById('workspaceType');
    const floorPlan = document.getElementById('floorPlan');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const bookingDateInput = document.getElementById('bookingDate');
    const confirmButton = document.getElementById('confirmBooking');
    const bookingSummary = document.getElementById('bookingSummary');
    const summaryContent = document.getElementById('summaryContent');
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');
    const durationSelect = document.getElementById('duration');
    const timeRangeSpan = document.getElementById('timeRange');
    const totalDurationSpan = document.getElementById('totalDuration');
    const additionalServices = document.getElementById('additionalServices');
    const deskServices = document.getElementById('deskServices');
    const officeServices = document.getElementById('officeServices');
    const meetingServices = document.getElementById('meetingServices');

    document.querySelector('ion-back-button').addEventListener('click', (e) => {
        e.preventDefault(); // Prevenir comportamiento por defecto
        
        // Verificar si hay cambios sin guardar
        if (hasUnsavedChanges()) {
            showConfirmationDialog();
        } else {
            navigateBack();
        }
    });

    // Función para verificar cambios sin guardar
    function hasUnsavedChanges() {
        return selectedDesks.size > 0 || 
               selectedOffices.size > 0 || 
               selectedMeetingRooms.size > 0 || 
               selectedServices.size > 0 ||
               selectedDate !== null ||
               selectedStartTime !== null ||
               selectedEndTime !== null;
    }

    // Función para mostrar diálogo de confirmación
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

    // Función para navegar hacia atrás
    function navigateBack() {
        // Limpiar selecciones
        selectedDesks.clear();
        selectedOffices.clear();
        selectedMeetingRooms.clear();
        selectedServices.clear();
        selectedDate = null;
        selectedStartTime = null;
        selectedEndTime = null;
        
        // Navegar a la página anterior
        window.location.href = '/web/pantalla_Inicio/inicio.html';
    }

    function generateWorkspaces(type) {
        const floorPlan = document.getElementById('floorPlan');
        const deskServices = document.getElementById('deskServices');
        const officeServices = document.getElementById('officeServices');
        const meetingServices = document.getElementById('meetingServices');
        
        floorPlan.innerHTML = '';
        
        // Ocultar todos los menús de servicios
        deskServices.style.display = 'none';
        officeServices.style.display = 'none';
        meetingServices.style.display = 'none';

        if (type === 'desk') {
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
                    desk.addEventListener('click', handleDeskSelection);
                }
                
                deskGrid.appendChild(desk);
            }
            
            floorPlan.appendChild(deskGrid);
            // Mostrar servicios adicionales para escritorios
            deskServices.style.display = 'block';
        } else if (type === 'meeting') {
            const meetingGrid = document.createElement('div');
            meetingGrid.className = 'meeting-grid';
            
            // Generar 10 salas de reuniones
            for (let i = 1; i <= 10; i++) {
                const room = document.createElement('div');
                room.className = 'meeting-room';
                const roomId = `M${i}`;
                room.dataset.id = roomId;
                
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

                // Verificar si la sala está en la lista de ocupadas
                if (occupiedSpaces.meeting.includes(roomId)) {
                    room.classList.add('occupied');
                } else {
                    room.addEventListener('click', handleMeetingRoomSelection);
                }
                
                meetingGrid.appendChild(room);
            }
            
            floorPlan.appendChild(meetingGrid);
            // Mostrar servicios adicionales para salas de reuniones
            meetingServices.style.display = 'block';
        } else if (type === 'office') {
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

                // Verificar si la oficina está en la lista de ocupadas
                if (occupiedSpaces.office.includes(officeId)) {
                    office.classList.add('occupied');
                } else {
                    office.addEventListener('click', handleOfficeSelection);
                }
                
                officeGrid.appendChild(office);
            }
            
            floorPlan.appendChild(officeGrid);
            // Mostrar servicios adicionales para oficinas
            officeServices.style.display = 'block';
        }
    }

    function handleDeskSelection(event) {
        if (this.classList.contains('occupied')) {
            showToast('Este escritorio no está disponible', 'danger');
            return;
        }

        const deskId = this.dataset.id;
        this.classList.toggle('selected');

        if (this.classList.contains('selected')) {
            selectedDesks.add(deskId);
        } else {
            selectedDesks.delete(deskId);
        }

        updateSelectionSummary();
        updateConfirmButton();
    }

    function handleOfficeSelection(event) {
        if (this.classList.contains('occupied')) {
            showToast('Esta oficina no está disponible', 'danger');
            return;
        }

        const officeId = this.dataset.id;
        this.classList.toggle('selected');

        if (this.classList.contains('selected')) {
            selectedOffices.add(officeId);
        } else {
            selectedOffices.delete(officeId);
        }

        updateOfficeSelectionSummary();
        updateConfirmButton();
    }

    function handleMeetingRoomSelection() {
        if (this.classList.contains('occupied')) {
            showToast('Esta sala no está disponible', 'danger');
            return;
        }

        const roomId = this.dataset.id;
        this.classList.toggle('selected');

        if (this.classList.contains('selected')) {
            selectedMeetingRooms.add(roomId);
        } else {
            selectedMeetingRooms.delete(roomId);
        }

        updateMeetingRoomSummary();
        updateConfirmButton();
    }

    function updateSelectionSummary() {
        const summaryDiv = document.getElementById('selectionSummary');
        const countSpan = document.getElementById('selectedCount');
        const detailsDiv = document.getElementById('selectedDesks');

        if (selectedDesks.size > 0) {
            summaryDiv.style.display = 'block';
            countSpan.textContent = selectedDesks.size;
            detailsDiv.innerHTML = Array.from(selectedDesks)
                .map(id => `<span class="desk-tag">${id}</span>`)
                .join('');
        } else {
            summaryDiv.style.display = 'none';
        }
    }

    function updateOfficeSelectionSummary() {
        const summaryDiv = document.getElementById('selectionSummary');
        const countSpan = document.getElementById('selectedCount');
        const detailsDiv = document.getElementById('selectedDesks');

        if (selectedOffices.size > 0) {
            summaryDiv.style.display = 'block';
            countSpan.textContent = selectedOffices.size;
            detailsDiv.innerHTML = Array.from(selectedOffices)
                .map(id => `<span class="office-tag">${id}</span>`)
                .join('');
        } else {
            summaryDiv.style.display = 'none';
        }
    }

    function updateMeetingRoomSummary() {
        const summaryDiv = document.getElementById('meetingRoomSummary');
        const countSpan = document.getElementById('selectedRoomCount');
        const detailsDiv = document.getElementById('selectedRooms');

        if (selectedMeetingRooms.size > 0) {
            summaryDiv.style.display = 'block';
            countSpan.textContent = selectedMeetingRooms.size;
            detailsDiv.innerHTML = Array.from(selectedMeetingRooms)
                .map(id => `<span class="room-tag">Sala ${id.replace('SR', '')}</span>`)
                .join('');
        } else {
            summaryDiv.style.display = 'none';
        }
    }

    // Generar slots de tiempo
    function generateTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        timeSlots.forEach(slot => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = slot;
            timeSlot.addEventListener('click', () => selectTimeSlot(timeSlot, slot));
            timeSlotsContainer.appendChild(timeSlot);
        });
    }

    // Generar opciones de tiempo
    function generateTimeOptions(select, startHour, endHour) {
        for (let hour = startHour; hour <= endHour; hour++) {
            const timeValue = `${hour.toString().padStart(2, '0')}:00`;
            const option = document.createElement('ion-select-option');
            option.value = timeValue;
            option.textContent = timeValue;
            select.appendChild(option);
        }
    }

    // Generar opciones iniciales para hora de inicio (7:00 - 23:00)
    generateTimeOptions(startTimeSelect, 7, 23);

    function updateAvailableEndTimes() {
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
        endTimeSelect.disabled = false;
    }

    function calculateDuration() {
        if (selectedStartTime && selectedEndTime) {
            const start = new Date(`2024-01-01 ${selectedStartTime}`);
            let end = new Date(`2024-01-01 ${selectedEndTime}`);
            
            if (selectedEndTime === '00:00') {
                end = new Date(`2024-01-02 00:00`);
            }
            
            const diffHours = (end - start) / (1000 * 60 * 60);
            totalDurationSpan.textContent = `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
            selectedTime = `${selectedStartTime} - ${selectedEndTime}`;
            updateConfirmButton();
        }
    }

    // Seleccionar espacio de trabajo
    function selectWorkspace(element, workspaceName) {
        document.querySelectorAll('.workspace-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        selectedWorkspace = workspaceName;
        updateConfirmButton();
    }

    // Seleccionar horario
    function selectTimeSlot(element, time) {
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        element.classList.add('selected');
        selectedTime = time;
        updateConfirmButton();
    }

    // Actualizar rango de tiempo
    function updateTimeRange() {
        if (selectedStartTime && selectedEndTime) {
            const startTime = new Date(`2024-01-01 ${selectedStartTime}`);
            let endTime = new Date(`2024-01-01 ${selectedEndTime}`);
            
            if (selectedEndTime === '00:00') {
                endTime = new Date(`2024-01-02 00:00`);
            }
            
            const diffHours = (endTime - startTime) / (1000 * 60 * 60);
            const timeRangeSpan = document.getElementById('timeRange');
            const totalDurationSpan = document.getElementById('totalDuration');
            
            timeRangeSpan.textContent = `${selectedStartTime} a ${selectedEndTime}`;
            totalDurationSpan.textContent = `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
            
            selectedTime = `${selectedStartTime} - ${selectedEndTime}`;
            updateConfirmButton();
        }
    }

    // Actualizar estado del botón de confirmación
    function updateConfirmButton() {
        const hasSelections = selectedDesks.size > 0 || 
                             selectedOffices.size > 0 || 
                             selectedMeetingRooms.size > 0;
        confirmButton.disabled = !hasSelections || !selectedDate || !selectedStartTime || !selectedEndTime;
    }

    // Event Listeners
    workspaceTypeSegment.addEventListener('ionChange', (ev) => {
        generateWorkspaces(ev.detail.value);
    });

    bookingDateInput.addEventListener('ionChange', (ev) => {
        const selectedDateObj = new Date(ev.detail.value);
        const today = new Date();
        
        // Verificar que la fecha no sea anterior a hoy
        if (selectedDateObj < today) {
            showToast('No puedes seleccionar una fecha pasada', 'danger');
            bookingDateInput.value = today.toISOString().split('T')[0];
            selectedDate = bookingDateInput.value;
        } else {
            selectedDate = ev.detail.value;
        }
        updateConfirmButton();
    });

    startTimeSelect.addEventListener('ionChange', (ev) => {
        selectedStartTime = ev.detail.value;
        updateAvailableEndTimes();
        updateTimeRange();
    });

    endTimeSelect.addEventListener('ionChange', (ev) => {
        selectedEndTime = ev.detail.value;
        calculateDuration();
        updateTimeRange();
    });

    confirmButton.addEventListener('click', async () => {
        const booking = {
            workspaces: [
                ...Array.from(selectedDesks),
                ...Array.from(selectedOffices),
                ...Array.from(selectedMeetingRooms)
            ].filter(Boolean),
            date: selectedDate,
            startTime: selectedStartTime,
            endTime: selectedEndTime,
            duration: document.getElementById('totalDuration').textContent,
            services: Array.from(selectedServices)
        };

        updateBookingSummary(booking);
        document.getElementById('bookingSummary').style.display = 'block';
    });

    document.getElementById('saveBooking').addEventListener('click', async () => {
        // Guardar en localStorage
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        reservations.push({
            workspaces: [
                ...Array.from(selectedDesks),
                ...Array.from(selectedOffices),
                ...Array.from(selectedMeetingRooms)
            ].filter(Boolean),
            date: selectedDate,
            startTime: selectedStartTime,
            endTime: selectedEndTime,
            duration: document.getElementById('totalDuration').textContent,
            services: Array.from(selectedServices)
        });
        localStorage.setItem('reservations', JSON.stringify(reservations));

        // Mostrar toast de confirmación
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
    });

    document.getElementById('modifyBooking').addEventListener('click', () => {
        document.getElementById('bookingSummary').style.display = 'none';
    });

    document.querySelectorAll('.service-item ion-checkbox').forEach(checkbox => {
        checkbox.addEventListener('ionChange', (ev) => {
            const service = ev.detail.checked;
            const serviceValue = ev.target.value;
            
            if (service) {
                selectedServices.add(serviceValue);
            } else {
                selectedServices.delete(serviceValue);
            }
            
            updateBookingSummary();
        });
    });

    function showToast(message, color = 'primary') {
        const toast = document.createElement('ion-toast');
        toast.message = message;
        toast.duration = 2000;
        toast.position = 'top';
        toast.color = color;
        document.body.appendChild(toast);
        toast.present();
    }

    function updateBookingSummary(booking) {
        const summaryContent = document.getElementById('summaryContent');
        
        // Determinar tipo de espacio y crear descripción
        let workspaceDescription = '';
        if (selectedDesks.size > 0) {
            workspaceDescription = `Escritorio${selectedDesks.size > 1 ? 's' : ''}: ${Array.from(selectedDesks).join(', ')}`;
        } else if (selectedOffices.size > 0) {
            workspaceDescription = `Oficina${selectedOffices.size > 1 ? 's' : ''}: ${Array.from(selectedOffices).join(', ')}`;
        } else if (selectedMeetingRooms.size > 0) {
            workspaceDescription = `Sala${selectedMeetingRooms.size > 1 ? 's' : ''} de Reuniones: ${Array.from(selectedMeetingRooms).join(', ')}`;
        }

        // Crear HTML del resumen
        summaryContent.innerHTML = `
            <div class="summary-info">
                <p><strong>Espacio:</strong> ${workspaceDescription}</p>
                <p><strong>Fecha:</strong> ${new Date(selectedDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
                <p><strong>Horario:</strong> ${selectedStartTime} a ${selectedEndTime}</p>
                <p><strong>Duración:</strong> ${document.getElementById('totalDuration').textContent}</p>
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

    function getServiceName(service) {
        const serviceNames = {
            // Servicios de oficina
            wifi: 'WiFi Premium',
            parking: 'Plaza de Parking',
            coffee: 'Cafetera',
            water: 'Dispensador de Agua',
            projector: 'Proyector',
            printer: 'Impresora',
            
            // Servicios de salas de reuniones
            wifi_meeting: 'WiFi Alta Velocidad',
            coffee_meeting: 'Servicio de Café',
            water_meeting: 'Agua Mineral',
            projector_meeting: 'Proyector Profesional',
            videoconf: 'Videoconferencia'
        };
        return serviceNames[service] || service;
    }

    function getServiceIcon(service) {
        const serviceIcons = {
            // Iconos comunes
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

    // Modificar la configuración del input de fecha
    function setupDateInput() {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() + 1); // Permitir reservas hasta 1 año en adelante

        const bookingDateInput = document.getElementById('bookingDate');
        bookingDateInput.min = today.toISOString().split('T')[0]; // Fecha mínima = hoy
        bookingDateInput.max = maxDate.toISOString().split('T')[0]; // Fecha máxima = 1 año después
        
        // Establecer el valor por defecto como el día actual
        bookingDateInput.value = today.toISOString().split('T')[0];
        selectedDate = bookingDateInput.value;
    }

    // Inicialización
    setupDateInput();
    generateWorkspaces('desk');
    generateTimeSlots();
});