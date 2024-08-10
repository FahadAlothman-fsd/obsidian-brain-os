import { pathToFileURL } from "url";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import builtins from "builtin-modules";
import UnoCSS from "unocss/vite";
import { PluginOption, defineConfig } from "vite";
import { preprocessMeltUI, sequence } from '@melt-ui/pp'

const setOutDir = (mode: string) => {
  if (mode === "development") {

    return `${__dirname}/../testing-plugins-vault/.obsidian/plugins/obsidian-brain-os`;
  }

  return `${__dirname}/build`;
};

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      UnoCSS(),
      svelte({
        preprocess: [vitePreprocess(), sequence([
          // ... other preprocessors
          preprocessMeltUI() // add to the end!
        ])]
      }) as PluginOption,
    ],
    build: {
      lib: {
        entry: "src/main",
        formats: ["cjs"],
      },
      rollupOptions: {
        output: {
          entryFileNames: "main.js",
          assetFileNames: "styles.css",
          sourcemapBaseUrl: pathToFileURL(
            setOutDir(mode)
          ).toString(),
        },
        external: [
          "obsidian",
          "electron",
          "@codemirror/autocomplete",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/highlight",
          "@lezer/lr",
          ...builtins,
        ],
      },
      outDir: setOutDir(mode),
      emptyOutDir: false,
      sourcemap: "inline",
    },
  };
});
