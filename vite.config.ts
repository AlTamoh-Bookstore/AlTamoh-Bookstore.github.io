import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Altamooh-book-store/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  publicDir: 'public',
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  // إضافة هذا للتأكد من معالجة المسارات بشكل صحيح
  experimental: {
    renderBuiltUrl(filename: string) {
      return '/Altamooh-book-store/' + filename
    }
  }
});
