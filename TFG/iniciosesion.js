document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector('ion-input[type="email"]').value;
        const password = loginForm.querySelector('ion-input[type="password"]').value;

        // Aquí iría la validación real con el backend
        if (email && password) {
            try {
                // Simulación de inicio de sesión exitoso
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userEmail', email);

                const toast = document.createElement('ion-toast');
                toast.message = '¡Inicio de sesión exitoso!';
                toast.duration = 2000;
                toast.position = 'top';
                toast.color = 'success';

                document.body.appendChild(toast);
                await toast.present();

                // Redireccionar a inicio.html después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'inicio.html';
                }, 2000);

            } catch (error) {
                const toast = document.createElement('ion-toast');
                toast.message = 'Error al iniciar sesión';
                toast.duration = 3000;
                toast.position = 'top';
                toast.color = 'danger';

                document.body.appendChild(toast);
                await toast.present();
            }
        }
    });
});