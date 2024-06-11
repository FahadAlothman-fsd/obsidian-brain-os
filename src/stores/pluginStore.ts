import { writable, derived } from "svelte/store";
import BrainOS from '../main'
import type { App, MetadataCache } from 'obsidian';
import type { Tag } from "../types";

const plugin = writable<BrainOS | undefined>();

const app = derived(plugin, ($plugin) => $plugin?.app ?? undefined)


const tags = (() => {

  const { subscribe, set } = writable<Tag[]>([])
  let _metaCache: MetadataCache | undefined
  app.subscribe(($app) => _metaCache = $app?.metadataCache ?? undefined)

  function loadTags() {
    if (_metaCache) {
      set(Object.entries(
        // @ts-ignore comment
        _metaCache.getTags() as Record<string, number>,
      )
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => {
          return { value: tag, count: count };
        }))
    }
  }

  return {
    subscribe,
    reload: () => loadTags(),
  }
})()


export { plugin, app, tags }
