// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://gdgsydney.com',
  // DevFest photos and logos live in Firebase Storage; Astro fetches and optimises them at build.
  image: {
    domains: ['storage.googleapis.com'],
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()]
});