import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno desde el sistema (para GitHub Actions) o archivo .env
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // Se utiliza './' para que los assets sean relativos y funcionen en cualquier ruta de despliegue
    base: './',
    define: {
      // Esto permite usar process.env.API_KEY de manera segura durante el build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});
