import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno desde el sistema (para GitHub Actions) o archivo .env
  // Cast process to any to avoid TS error if @types/node is missing or incomplete
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // IMPORTANTE: Reemplaza 'dta' con el nombre exacto de tu repositorio en GitHub
    base: '/dta/', 
    define: {
      // Esto permite usar process.env.API_KEY de manera segura durante el build
      // Si la variable no existe, se asigna una cadena vacía para evitar errores de compilación,
      // pero la app fallará lógicamente si no se provee la key en los secretos de GitHub.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});
