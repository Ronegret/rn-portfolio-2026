import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = 'https://rodrigonegrete.es';
// Subpaginas estaticas servidas desde public/ (Astro no las conoce): se anaden a mano.
const staticPages = ['zodi', 'dedicalo-play', 'pdf-rodd', 'rodd-es', 'aem', 'aquae', 'ccse', 'cv', 'dedicalo', 'invitoo', 'paratumundo', 'te-atiendo', 'tomapoly', 'travel-of-vapers'];

export default defineConfig({
  site,
  integrations: [sitemap({ customPages: staticPages.map((p) => `${site}/${p}/`) })],
});
