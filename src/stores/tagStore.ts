import { writable, derived } from "svelte/store";
import BrainOS from '../main'
import { app } from "./pluginStore";
import type {
  App,
  MetadataCache,
} from 'obsidian';
import type { Tag as tagType } from "../types";
import { Notice, parseFrontMatterAliases, parseFrontMatterTags } from "obsidian";

const tagBody = /^#[^\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,.:;<=>?@^`{|}~\[\]\\\s]+$/;

class Tag {
  tag: string;
  canonical: string;
  name: string;
  matches: (text: string) => boolean
  canonical_prefix: string

  constructor(name: string) {
    const
      hashed = this.tag = Tag.toTag(name),
      canonical = this.canonical = hashed.toLowerCase(),
      canonical_prefix = this.canonical_prefix = canonical + "/";
    this.name = hashed.slice(1);
    this.matches = function(text) {
      text = text.toLowerCase();
      return text == canonical || text.startsWith(canonical_prefix);
    };
  }
  toString() { return this.tag; }

  static isTag(s: string) { return tagBody.test(s); }

  static toTag(name: string) {
    while (name.startsWith("##")) name = name.slice(1);
    return name.startsWith("#") ? name : "#" + name;
  }

  static toName(tag: string) {
    return this.toTag(tag).slice(1);
  }

  static canonical(name: string) {
    return Tag.toTag(name).toLowerCase();
  }
}

export class Replacement {

  inString: (text: string, pos?: number) => string
  inArray: (tags: string[], skipOdd?: boolean, isAlias?: boolean) => string[]
  willMergeTags: (tagNames: string[]) => Tag[] | undefined

  constructor(fromTag: Tag, toTag: Tag) {
    const cache = Object.assign(
      Object.create(null), {
      [fromTag.tag]: toTag.tag,
      [fromTag.name]: toTag.name,
    }
    );

    this.inString = function(text: string, pos = 0) {
      return text.slice(0, pos) + toTag.tag + text.slice(pos + fromTag.tag.length);
    }

    this.inArray = (tags, skipOdd, isAlias) => {
      return tags.map((t, i) => {
        if (skipOdd && (i & 1)) return t;   // leave odd entries (separators) alone
        // Obsidian allows spaces as separators within array elements
        if (!t || typeof t !== "string") return t;
        // Skip non-tag parts
        if (isAlias) {
          if (!t.startsWith("#") || !Tag.isTag(t)) return t;
        } else if (/[ ,\n]/.test(t)) {
          return this.inArray(t.split(/([, \n]+)/), true).join("");
        }
        if (cache[t]) return cache[t];
        const lc = t.toLowerCase();
        if (cache[lc]) {
          return cache[t] = cache[lc];
        } else if (lc.startsWith(fromTag.canonical_prefix)) {
          return cache[t] = cache[lc] = this.inString(t);
        } else if (("#" + lc).startsWith(fromTag.canonical_prefix)) {
          return cache[t] = cache[lc] = this.inString("#" + t).slice(1);
        }
        return cache[t] = cache[lc] = t;
      });
    };

    this.willMergeTags = function(tagNames) {
      // Renaming to change case doesn't lose info, so ignore it
      if (fromTag.canonical === toTag.canonical) return;

      const existing = new Set(tagNames.map(s => s.toLowerCase()));

      for (const tagName of tagNames.filter(fromTag.matches)) {
        const changed = this.inString(tagName);
        if (existing.has(changed.toLowerCase()))
          return [new Tag(tagName), new Tag(changed)];
      }

    }
  }
}


const tags = (() => {

  const { subscribe, set } = writable<tagType[]>([])
  let _metaCache: MetadataCache | undefined
  app.subscribe(($app) => _metaCache = $app?.metadataCache ?? undefined)

  // async function renameTag(tagName: string, toName = tagName, newName: string) {
  //   // const newName = await promptForNewName(tagName, toName);
  //   // if (newName === false) return;  // aborted
  //
  //   if (!newName || newName === tagName) {
  //     return new Notice("Unchanged or empty tag: No changes made.");
  //   }
  //
  //   const
  //     oldTag = new Tag(tagName),
  //     newTag = new Tag(newName),
  //     replace = new Replacement(oldTag, newTag),
  //     clashing = replace.willMergeTags(
  //       allTags(app).reverse()   // find longest clash first
  //     ),
  //     shouldAbort = clashing &&
  //       await shouldAbortDueToClash(clashing, oldTag, newTag)
  //     ;
  //
  //   if (shouldAbort) return;
  //
  //   const targets = await findTargets(app, oldTag);
  //   if (!targets) return;
  //
  //   const progress = new Progress(`Renaming to #${newName}/*`, "Processing files...");
  //   let renamed = 0;
  //   await progress.forEach(targets, async (target) => {
  //     progress.message = "Processing " + target.basename;
  //     if (await target.renamed(replace)) renamed++;
  //   });
  //
  //   return new Notice(`Operation ${progress.aborted ? "cancelled" : "complete"}: ${renamed} file(s) updated`);
  //
  // }

  // async function findTargets(tag: Tag) {
  //   const targets = [];
  //   const progress = new Progress(`Searching for ${tag}/*`, "Matching files...");
  //   await progress.forEach(
  //     _metaCache.getCachedFiles(),
  //     filename => {
  //       let { frontmatter, tags } = app.metadataCache.getCache(filename) || {};
  //       tags = (tags || []).filter(t => t.tag && tag.matches(t.tag)).reverse(); // last positions first
  //       const fmtags = (parseFrontMatterTags(frontmatter) || []).filter(tag.matches);
  //       const aliasTags = (parseFrontMatterAliases(frontmatter) || []).filter(Tag.isTag).filter(tag.matches);
  //       if (tags.length || fmtags.length || aliasTags.length)
  //         targets.push(new File(app, filename, tags, fmtags.length + aliasTags.length));
  //     }
  //   );
  //   if (!progress.aborted)
  //     return targets;
  // }

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


