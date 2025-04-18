document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    setupEventListeners();

    // Añadir manejador para el botón de volver
    document.querySelector('ion-back-button').addEventListener('click', (e) => {
        e.preventDefault();
        navigateBack();
    });
});

function loadUserProfile() {
    // Obtener datos del usuario desde sessionStorage
    const userName = sessionStorage.getItem('userName');
    const userEmail = sessionStorage.getItem('userEmail');
    const notifications = sessionStorage.getItem('notifications') === 'true';
    const currentTheme = sessionStorage.getItem('theme') || 'light'; // Obtener tema guardado
    
    // Cargar datos del usuario
    const userProfile = {
        name: userName || 'Usuario',
        email: userEmail || 'usuario@email.com',
        department: 'Tecnología',
        position: 'Desarrollador Senior',
        notifications: notifications !== null ? notifications : true,
        theme: currentTheme
    };

    // Actualizar la interfaz y aplicar el tema
    document.getElementById('userName').textContent = userProfile.name;
    document.getElementById('userEmail').textContent = userProfile.email;
    document.getElementById('fullName').textContent = userProfile.name;
    document.getElementById('department').textContent = userProfile.department;
    document.getElementById('position').textContent = userProfile.position;
    document.getElementById('notificationsToggle').checked = userProfile.notifications;
    document.getElementById('themeSelect').value = userProfile.theme;
    
    // Aplicar el tema actual
    applyTheme(userProfile.theme);
}

function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    
    if (theme === 'dark') {
        document.body.style.setProperty('--ion-background-color', '#121212');
        document.body.style.setProperty('--ion-text-color', '#ffffff');
        document.body.style.setProperty('--ion-toolbar-background', '#1e1e1e');
        document.body.style.setProperty('--ion-item-background', '#1e1e1e');
        document.body.style.setProperty('--ion-card-background', '#1e1e1e');
        // Nuevas variables para mejor contraste
        document.body.style.setProperty('--ion-color-step-50', '#1e1e1e');
        document.body.style.setProperty('--ion-color-step-100', '#2a2a2a');
        document.body.style.setProperty('--ion-color-step-150', '#363636');
        document.body.style.setProperty('--ion-color-step-200', '#414141');
        document.body.style.setProperty('--ion-color-step-850', '#e0e0e0');
        document.body.style.setProperty('--ion-color-step-900', '#f0f0f0');
    } else {
        document.body.style.setProperty('--ion-background-color', '#ffffff');
        document.body.style.setProperty('--ion-text-color', '#000000');
        document.body.style.setProperty('--ion-toolbar-background', '#f8f9fa');
        document.body.style.setProperty('--ion-item-background', '#ffffff');
        document.body.style.setProperty('--ion-card-background', '#ffffff');
        // Restablecer variables para modo claro
        document.body.style.setProperty('--ion-color-step-50', '#f2f2f2');
        document.body.style.setProperty('--ion-color-step-100', '#e6e6e6');
        document.body.style.setProperty('--ion-color-step-150', '#d9d9d9');
        document.body.style.setProperty('--ion-color-step-200', '#cccccc');
        document.body.style.setProperty('--ion-color-step-850', '#262626');
        document.body.style.setProperty('--ion-color-step-900', '#1a1a1a');
    }
}

function setupEventListeners() {
    // Manejar edición de perfil
    document.getElementById('editProfileButton').addEventListener('click', () => {
        showEditProfileModal();
    });

    // Manejar cambio de notificaciones
    document.getElementById('notificationsToggle').addEventListener('ionChange', (ev) => {
        const isEnabled = ev.detail.checked;
        updateNotificationPreference(isEnabled);
    });

    // Manejar cambio de tema
    document.getElementById('themeSelect').addEventListener('ionChange', (ev) => {
        updateThemePreference(ev.detail.value);
    });

    // Manejar cierre de sesión
    document.getElementById('logoutButton').addEventListener('click', () => {
        showLogoutConfirmation();
    });
}

async function showEditProfileModal() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Editar Perfil';
    alert.inputs = [
        {
            name: 'name',
            type: 'text',
            placeholder: 'Nombre completo',
            value: document.getElementById('fullName').textContent
        },
        {
            name: 'department',
            type: 'text',
            placeholder: 'Departamento',
            value: document.getElementById('department').textContent
        },
        {
            name: 'position',
            type: 'text',
            placeholder: 'Cargo',
            value: document.getElementById('position').textContent
        }
    ];
    alert.buttons = [
        {
            text: 'Cancelar',
            role: 'cancel'
        },
        {
            text: 'Guardar',
            handler: (data) => {
                updateProfile(data);
            }
        }
    ];

    document.body.appendChild(alert);
    await alert.present();
}

function updateProfile(data) {
    // Actualizar datos en la interfaz
    document.getElementById('userName').textContent = data.name;
    document.getElementById('fullName').textContent = data.name;
    document.getElementById('department').textContent = data.department;
    document.getElementById('position').textContent = data.position;

    // Mostrar confirmación
    showToast('Perfil actualizado correctamente');
}

async function showLogoutConfirmation() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Cerrar Sesión';
    alert.message = '¿Estás seguro de que deseas cerrar sesión?';
    alert.buttons = [
        {
            text: 'Cancelar',
            role: 'cancel'
        },
        {
            text: 'Sí, cerrar sesión',
            handler: () => {
                logout();
            }
        }
    ];

    document.body.appendChild(alert);
    await alert.present();
}

function logout() {
    // Limpiar datos de sesión
    sessionStorage.clear();
    // Redirigir a login
    window.location.href = '/web/login_registro/iniciosesion.html';
}

async function showToast(message) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 2000;
    toast.position = 'top';
    toast.color = 'success';

    document.body.appendChild(toast);
    await toast.present();
}

async function updateNotificationPreference(enabled) {
    // Guardar preferencia en sessionStorage
    sessionStorage.setItem('notifications', enabled);

    // Mostrar confirmación al usuario
    const toast = document.createElement('ion-toast');
    toast.message = `Notificaciones ${enabled ? 'activadas' : 'desactivadas'}`;
    toast.duration = 2000;
    toast.position = 'top';
    toast.color = enabled ? 'success' : 'medium';

    document.body.appendChild(toast);
    await toast.present();

    // Si las notificaciones están activadas, solicitar permiso del navegador
    if (enabled && "Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                // Mostrar una notificación de prueba
                new Notification("CoWorkGo", {
                    body: "Las notificaciones han sido activadas",
                    icon: "/assets/icon.png" // Asegúrate de tener un icono
                });
            }
        });
    }
}

async function updateThemePreference(theme) {
    // Guardar preferencia en sessionStorage
    sessionStorage.setItem('theme', theme);
    
    // Aplicar el nuevo tema usando el gestor global
    window.applyGlobalTheme();

    // Mostrar confirmación
    const toast = document.createElement('ion-toast');
    toast.message = `Tema ${theme === 'dark' ? 'oscuro' : 'claro'} aplicado`;
    toast.duration = 2000;
    toast.position = 'top';
    toast.color = 'success';

    document.body.appendChild(toast);
    await toast.present();
}

async function navigateBack() {
    const hasChanges = checkForChanges(); // Función para verificar cambios sin guardar

    if (hasChanges) {
        const alert = document.createElement('ion-alert');
        alert.header = 'Cambios sin guardar';
        alert.message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
        alert.buttons = [
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    console.log('Navegación cancelada');
                }
            },
            {
                text: 'Salir',
                handler: () => {
                    window.location.href = '/web/pantalla_Inicio/inicio.html';
                }
            }
        ];

        document.body.appendChild(alert);
        await alert.present();
    } else {
        window.location.href = '/web/pantalla_Inicio/inicio.html';
    }
}

function checkForChanges() {
    // Verificar si hay cambios sin guardar comparando con los valores originales
    const originalProfile = {
        name: document.getElementById('userName').textContent,
        department: document.getElementById('department').textContent,
        position: document.getElementById('position').textContent
    };

    return false; // Por defecto retorna false si no hay cambios
}

// Actualizar los estilos CSS para los temas
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .light-theme {
        --background-color: #ffffff;
        --text-color: #000000;
        --card-background: #ffffff;
        --border-color: #e0e0e0;
        --label-color: #666666;
        --value-color: #333333;
    }

    .dark-theme {
        --background-color: #121212;
        --text-color: #ffffff;
        --card-background: #1e1e1e;
        --border-color: #333333;
        --label-color: #e0e0e0;
        --value-color: #ffffff;
    }

    .dark-theme .profile-section {
        background-color: var(--card-background);
        border-color: var(--border-color);
    }

    .dark-theme .profile-info-label {
        color: var(--label-color);
    }

    .dark-theme .profile-info-value {
        color: var(--value-color);
    }

    .dark-theme .profile-name {
        color: #ffffff;
    }

    .dark-theme .profile-email {
        color: #e0e0e0;
    }

    .dark-theme .profile-section h3 {
        color: #ffffff;
    }

    .dark-theme .profile-section h3 ion-icon {
        color: #4a90e2;
    }

    .dark-theme ion-item {
        --highlight-color-focused: #4a90e2;
        --highlight-color-valid: #2dd36f;
        --highlight-color-invalid: #eb445a;
    }

    .dark-theme ion-toggle {
        --background: #333333;
        --background-checked: #4a90e2;
    }

    .dark-theme ion-select {
        --placeholder-color: #e0e0e0;
        --text-color: #ffffff;
    }

    .dark-theme .profile-header {
        background: #1e1e1e;
        border: 1px solid #333333;
    }

    .dark-theme .profile-avatar {
        background: #4a90e2;
        border: 2px solid #666666;
    }

    .dark-theme .profile-avatar ion-icon {
        color: #ffffff;
    }

    .dark-theme .profile-name {
        color: #ffffff;
        text-shadow: none;
    }

    .dark-theme .profile-email {
        color: #4a90e2;
        opacity: 0.9;
    }

    .dark-theme .profile-section {
        background-color: #1e1e1e;
        border: 1px solid #333333;
    }

    .dark-theme .profile-section h3 {
        color: #ffffff;
    }

    .dark-theme .profile-section h3 ion-icon {
        color: #4a90e2;
    }

    .dark-theme .profile-info-label {
        color: #e0e0e0;
    }

    .dark-theme .profile-info-value {
        color: #ffffff;
    }

    /* Efectos hover para mejor interactividad */
    .dark-theme .profile-section:hover {
        background-color: #252525;
        transition: background-color 0.3s ease;
    }

    .dark-theme ion-button {
        --background: #4a90e2;
        --background-hover: #357abd;
        --color: #ffffff;
    }

    .dark-theme ion-button.danger {
        --background: #cf3c4f;
        --background-hover: #b33545;
    }
`;
document.head.appendChild(styleSheet);

const headElement = document.querySelector('head');
const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = 'global-theme.css';
headElement.appendChild(linkElement);

const scriptElement = document.createElement('script');
scriptElement.src = 'theme-manager.js';
headElement.appendChild(scriptElement);