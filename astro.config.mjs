// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  resolve: {
    // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
    // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
    alias: import.meta.env.PROD && {
      'react-dom/server': 'react-dom/server.edge',
    },
  },
  output: "server",

  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    })
  ],
});
