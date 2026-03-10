import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use relative asset paths so GitHub Pages project sites work reliably
  // regardless of branch/environment variables.
  base: './'
});
