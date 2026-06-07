import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        aquae: resolve(__dirname, 'aquae/index.html'),
        zodi: resolve(__dirname, 'zodi/index.html'),
        zodiBto: resolve(__dirname, 'zodi-bto/index.html'),
        pdfRodd: resolve(__dirname, 'pdf-rodd/index.html'),
        pdfEditor: resolve(__dirname, 'PDF/index.html'),
        ccse: resolve(__dirname, 'ccse/index.html'),
        paratumundo: resolve(__dirname, 'paratumundo/index.html'),
        teAtiendo: resolve(__dirname, 'te-atiendo/index.html'),
        travelOfVapers: resolve(__dirname, 'travel-of-vapers/index.html'),
        invitoo: resolve(__dirname, 'invitoo/index.html'),
        tomapoly: resolve(__dirname, 'tomapoly/index.html'),
        dedicalo: resolve(__dirname, 'dedicalo/index.html'),
        cv: resolve(__dirname, 'cv/index.html'),
      },
    },
  },
});
