import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.coworkgo.app',
  appName: 'CoWorkGo',
  webDir: 'dist/coworkgo/browser',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    StatusBar: {
      backgroundColor: "#4D7CEA",
      style: "light"
    },
    // Añadimos la configuración de App para manejar el esquema personalizado
    App: {
      url: 'https://coworkgo.app', // URL base de tu app (cámbiala si es diferente)
      androidScheme: 'coworkgo',   // Esquema para redirecciones en Android
      iosScheme: 'coworkgo'        // Esquema para redirecciones en iOS
    }
  }
};

export default config;
