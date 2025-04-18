function applyGlobalTheme() {
    const currentTheme = sessionStorage.getItem('theme') || 'light';
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${currentTheme}-theme`);
    
    if (currentTheme === 'dark') {
        document.body.style.setProperty('--ion-background-color', '#121212');
        document.body.style.setProperty('--ion-text-color', '#ffffff');
        document.body.style.setProperty('--ion-toolbar-background', '#1e1e1e');
        document.body.style.setProperty('--ion-item-background', '#1e1e1e');
        document.body.style.setProperty('--ion-card-background', '#1e1e1e');
        document.body.style.setProperty('--ion-color-step-50', '#1e1e1e');
        document.body.style.setProperty('--ion-color-step-100', '#2a2a2a');
        document.body.style.setProperty('--ion-color-step-150', '#363636');
        document.body.style.setProperty('--ion-color-step-850', '#e0e0e0');
        document.body.style.setProperty('--ion-color-step-900', '#f0f0f0');
    } else {
        document.body.style.setProperty('--ion-background-color', '#ffffff');
        document.body.style.setProperty('--ion-text-color', '#000000');
        document.body.style.setProperty('--ion-toolbar-background', '#f8f9fa');
        document.body.style.setProperty('--ion-item-background', '#ffffff');
        document.body.style.setProperty('--ion-card-background', '#ffffff');
    }
}

// Aplicar tema al cargar
document.addEventListener('DOMContentLoaded', applyGlobalTheme);

// Exportar función para uso en otros archivos
window.applyGlobalTheme = applyGlobalTheme;