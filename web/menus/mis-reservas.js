document.addEventListener('DOMContentLoaded', () => {
    loadReservations();

    // Añadir manejador para el botón de volver
    document.getElementById('backButton').addEventListener('click', (e) => {
        e.preventDefault();
        navigateBack();
    });
});

function loadReservations() {
    const reservationsList = document.getElementById('reservationsList');
    const allReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    // Filtrar solo reservas activas (fecha igual o posterior a hoy)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear la hora para comparar solo fechas
    
    const activeReservations = allReservations.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        return reservationDate >= today;
    });

    if (activeReservations.length === 0) {
        showEmptyState();
        return;
    }

    // Ordenar reservas por fecha (más cercanas primero)
    activeReservations.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Añadir encabezado de resumen
    reservationsList.innerHTML = `
        <div class="summary-header">
            <h2>Reservas Activas (${activeReservations.length})</h2>
            <p>Mostrando solo las reservas vigentes y futuras</p>
        </div>
    `;

    // Generar las tarjetas de reserva
    reservationsList.innerHTML += activeReservations.map((reservation, index) => {
        const reservationDate = new Date(reservation.date);
        
        return `
            <div class="reservation-card">
                <div class="reservation-header">
                    <span class="reservation-date">
                        ${reservationDate.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                    <span class="reservation-status status-active">
                        Activa
                    </span>
                </div>
                <div class="reservation-details">
                    <div class="detail-item">
                        <ion-icon name="${getWorkspaceIcon(reservation.workspaces[0])}"></ion-icon>
                        <span>${getWorkspaceDescription(reservation.workspaces)}</span>
                    </div>
                    <div class="detail-item">
                        <ion-icon name="time-outline"></ion-icon>
                        <span>${reservation.startTime} - ${reservation.endTime} (${reservation.duration})</span>
                    </div>
                    ${reservation.services.length > 0 ? `
                        <div class="services-list">
                            ${reservation.services.map(service => `
                                <span class="service-tag">
                                    <ion-icon name="${getServiceIcon(service)}"></ion-icon>
                                    ${getServiceName(service)}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <ion-button color="danger" expand="block" onclick="cancelReservation(${index})">
                    <ion-icon name="close-circle-outline" slot="start"></ion-icon>
                    Cancelar Reserva
                </ion-button>
            </div>
        `;
    }).join('');
}

function showEmptyState() {
    const reservationsList = document.getElementById('reservationsList');
    reservationsList.innerHTML = `
        <div class="empty-state">
            <ion-icon name="calendar-outline"></ion-icon>
            <h2>No tienes reservas</h2>
            <p>Cuando reserves un espacio, aparecerá aquí</p>
            <ion-button href="reservar.html">
                Hacer una reserva
            </ion-button>
        </div>
    `;
}

function getWorkspaceIcon(workspace) {
    if (workspace.startsWith('D')) return 'desktop-outline';
    if (workspace.startsWith('O')) return 'business-outline';
    if (workspace.startsWith('M')) return 'people-outline';
    return 'location-outline';
}

function getWorkspaceDescription(workspaces) {
    const types = {
        'D': 'Escritorio',
        'O': 'Oficina',
        'M': 'Sala de Reuniones'
    };
    
    const type = types[workspaces[0][0]];
    return `${type} ${workspaces.length > 1 ? `(${workspaces.length})` : workspaces[0]}`;
}

function getServiceIcon(service) {
    const icons = {
        wifi: 'wifi-outline',
        parking: 'car-outline',
        coffee: 'cafe-outline',
        water: 'water-outline',
        projector: 'tv-outline',
        printer: 'print-outline',
        videoconf: 'videocam-outline'
    };
    return icons[service] || 'add-outline';
}

function getServiceName(service) {
    const names = {
        wifi: 'WiFi Premium',
        parking: 'Plaza de Parking',
        coffee: 'Cafetera',
        water: 'Dispensador de Agua',
        projector: 'Proyector',
        printer: 'Impresora',
        videoconf: 'Videoconferencia'
    };
    return names[service] || service;
}

function cancelReservation(index) {
    const alert = document.createElement('ion-alert');
    alert.header = 'Confirmar cancelación';
    alert.message = '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.';
    alert.buttons = [
        {
            text: 'No',
            role: 'cancel',
            handler: () => {
                console.log('Cancelación abortada');
            }
        },
        {
            text: 'Sí, cancelar',
            handler: () => {
                // Obtener las reservas actuales
                let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                
                // Eliminar la reserva del array
                reservations.splice(index, 1);
                
                // Guardar el array actualizado en localStorage
                localStorage.setItem('reservations', JSON.stringify(reservations));
                
                // Mostrar mensaje de confirmación
                const toast = document.createElement('ion-toast');
                toast.message = 'Reserva cancelada con éxito';
                toast.duration = 2000;
                toast.position = 'top';
                toast.color = 'success';
                document.body.appendChild(toast);
                toast.present();
                
                // Recargar la lista de reservas
                loadReservations();
                
                // Si no quedan reservas, mostrar el estado vacío
                if (reservations.length === 0) {
                    showEmptyState();
                }
            }
        }
    ];
    
    // Mostrar el diálogo de confirmación
    document.body.appendChild(alert);
    alert.present();
}

function navigateBack() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Confirmar';
    alert.message = '¿Deseas volver a la pantalla de inicio?';
    alert.buttons = [
        {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
                console.log('Operación cancelada');
            }
        },
        {
            text: 'Sí, volver',
            handler: () => {
                window.location.href = '/web/pantalla_Inicio/inicio.html';
            }
        }
    ];

    document.body.appendChild(alert);
    alert.present();
}