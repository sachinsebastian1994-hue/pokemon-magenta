// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://sachinsebastian1994-hue-pokemon-mag.vercel.app',
  adapter: vercel()
});