document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario está autenticado
  const isAuthenticated = sessionStorage.getItem('isAuthenticated');
  
  if (!isAuthenticated) {
    window.location.href = 'iniciosesion.html';
    return;
  }

  // Cargar datos del usuario
  const username = sessionStorage.getItem('username');
  if (username) {
    document.querySelector('.header-container h2').textContent = `¡Bienvenido de nuevo, ${username}!`;
  }

  // Manejar notificaciones
  const notificationButton = document.querySelector('ion-button ion-icon[name="notifications-outline"]');
  notificationButton.parentElement.addEventListener('click', async () => {
    const toast = document.createElement('ion-toast');
    toast.message = 'No tienes notificaciones nuevas';
    toast.duration = 2000;
    toast.position = 'top';
    document.body.appendChild(toast);
    await toast.present();
  });

  // Manejar perfil
  const profileButton = document.querySelector('ion-button ion-icon[name="person-circle-outline"]');
  profileButton.parentElement.addEventListener('click', () => {
    window.location.href = 'perfil.html';
  });
});

function loadActiveReservationsSummary() {
    const summaryContainer = document.getElementById('reservationSummary');
    const allReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    // Filtrar reservas activas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeReservations = allReservations.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        return reservationDate >= today;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (activeReservations.length > 0) {
        // Tomar la próxima reserva
        const nextReservation = activeReservations[0];
        const reservationDate = new Date(nextReservation.date);

        summaryContainer.innerHTML = `
            <div class="summary-card active-reservation">
                <h3>
                    <ion-icon name="calendar-outline"></ion-icon>
                    Próxima Reserva
                </h3>
                <div class="reservation-details">
                    <p class="reservation-date">
                        ${reservationDate.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                    <div class="reservation-info">
                        <p>
                            <ion-icon name="${getWorkspaceIcon(nextReservation.workspaces[0])}"></ion-icon>
                            ${getWorkspaceDescription(nextReservation.workspaces)}
                        </p>
                        <p>
                            <ion-icon name="time-outline"></ion-icon>
                            ${nextReservation.startTime} - ${nextReservation.endTime}
                        </p>
                    </div>
                    ${nextReservation.services.length > 0 ? `
                        <div class="services-summary">
                            <p class="services-title">Servicios incluidos:</p>
                            <div class="services-list">
                                ${nextReservation.services.map(service => `
                                    <span class="service-tag">
                                        <ion-icon name="${getServiceIcon(service)}"></ion-icon>
                                        ${getServiceName(service)}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <ion-button href="mis-reservas.html" expand="block" fill="clear">
                        Ver todas mis reservas
                        <ion-icon slot="end" name="arrow-forward"></ion-icon>
                    </ion-button>
                </div>
            </div>
        `;
    } else {
        summaryContainer.innerHTML = `
            <div class="summary-card no-reservations">
                <h3>
                    <ion-icon name="calendar-outline"></ion-icon>
                    Próxima Reserva
                </h3>
                <div class="empty-state">
                    <p>No tienes reservas pendientes</p>
                    <ion-button href="reservar.html" expand="block">
                        Hacer una reserva
                        <ion-icon slot="end" name="add-outline"></ion-icon>
                    </ion-button>
                </div>
            </div>
        `;
    }
}