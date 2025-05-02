document.addEventListener('DOMContentLoaded', () => {
  let isUserLoggedIn = false; // Variable para verificar si el usuario está logeado

  const startReservationButton = document.getElementById('start-reservation');

  // Función para mostrar un mensaje push (Toast)
  const showToast = async (message) => {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 3000;
    toast.position = 'top';
    document.body.appendChild(toast);
    await toast.present();
  };

  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');

  // Evento para el botón de iniciar sesión
  loginButton.addEventListener('click', () => {
    window.location.href = '/web/login_registro/iniciosesion.html';
  });

  // Evento para el botón de registro
  registerButton.addEventListener('click', () => {
    window.location.href = '/web/login_registro/registro.html';
  });

});