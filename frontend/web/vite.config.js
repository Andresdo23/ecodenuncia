import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

// Definição de Caminhos (Compatibilidade ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  // Configuração de Testes (Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.join(__dirname, 'src/setupTests.js')],
  },

  // Resolução de Caminhos (Alias)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
});