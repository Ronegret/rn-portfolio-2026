import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

const site = 'https://rodrigonegrete.es';
// Subpaginas estaticas servidas desde public/ (Astro no las conoce): se anaden a mano.
const staticPages = ['zodi', 'dedicalo-play', 'pdf-rodd', 'rodd-es', 'aem', 'kettelbro', 'capsule-corp', 'portfolio-2026', 'aquae', 'ccse', 'cv', 'dedicalo', 'invitoo', 'paratumundo', 'te-atiendo', 'tomapoly', 'travel-of-vapers', 'just-enjoy', 'iberdata', 'zodi-bto'];

export default defineConfig({
  site,
  integrations: [react(), sitemap({ customPages: staticPages.map((p) => `${site}/${p}/`) })],
});
