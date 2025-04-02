document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener los valores del formulario
    const nombre = registerForm.querySelector('ion-input[type="text"]').value;
    const email = registerForm.querySelector('ion-input[type="email"]').value;
    const password = registerForm.querySelectorAll('ion-input[type="password"]')[0].value;
    const confirmPassword = registerForm.querySelectorAll('ion-input[type="password"]')[1].value;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      const toast = document.createElement('ion-toast');
      toast.message = 'Las contraseñas no coinciden';
      toast.duration = 2000;
      toast.position = 'top';
      toast.color = 'danger';
      document.body.appendChild(toast);
      await toast.present();
      return;
    }

    try {
      // Aquí iría la lógica de registro
      console.log('Registrando usuario:', { nombre, email });

      // Mostrar mensaje de éxito
      const toast = document.createElement('ion-toast');
      toast.message = '¡Registro exitoso!';
      toast.duration = 2000;
      toast.position = 'top';
      toast.color = 'success';

      document.body.appendChild(toast);
      await toast.present();

      // Redireccionar después del registro exitoso
      setTimeout(() => {
        window.location.href = 'iniciosesion.html';
      }, 2000);

    } catch (error) {
      // Mostrar mensaje de error
      const toast = document.createElement('ion-toast');
      toast.message = 'Error en el registro. Por favor, inténtalo de nuevo.';
      toast.duration = 3000;
      toast.position = 'top';
      toast.color = 'danger';

      document.body.appendChild(toast);
      await toast.present();
    }
  });
});