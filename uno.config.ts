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
  shortcuts: {
    "btn-data-disabled": "pointer-events-none rounded-lg p-1 opacity-40",
    "cell-data-disabled": "pointer-events-none opacity-40",
    "cell-data-unavailable": "pointer-events-none text-red-400 line-through",
    "cell-data-selected": "bg-magnum-400 text-neutral-950",
    "cell-data-outside-visible-months": "pointer-events-none cursor-default opacity-40 hover:bg-transparent",
    "cell-data-outside-month": "pointer-events-none cursor-default opacity-0 hover:bg-transparent",

  },
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
    },
    transitionProperty: {
      'spacing': 'margin, padding',
      'rounding': 'border-radius'
    }
  }
});
