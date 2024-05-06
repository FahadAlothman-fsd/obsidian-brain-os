import { defineConfig, presetIcons, presetAttributify } from "unocss";
import extractorSvelte from "@unocss/extractor-svelte";
import presetUno from "@unocss/preset-uno";

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons(
    {
      scale: 1.2,
      extraProperties: {
        'vertical-align': 'middle',
      },
    }
  )],
  extractors: [extractorSvelte()],
  theme: {
    colors: {
      'magnum-50': '#fff9ed',
      'magnum-100': '#fef2d6',
      'magnum-200': '#fce0ac',
      'magnum-300': '#f9c978',
      'magnum-400': '#f7b155',
      'magnum-500': '#f38d1c',
      'magnum-600': '#e47312',
      'magnum-700': '#bd5711',
      'magnum-800': '#964516',
      'magnum-900': '#793a15',
      'magnum-950': '#411c09',
    }
  }
});
