import { App, TAbstractFile, type TagCache, TFolder } from "obsidian";
import { Component, MarkdownRenderer, Notice, TFile, moment } from "obsidian";
// import { CST, parseDocument, type Node } from "yaml";
import { I18N_MAP } from "../i18n";
import { ERROR_MESSAGE } from "../constants";
import type { BrainSettings } from "../types";
// import { Tag, Replacement } from "./tag";

export function trimFile(file: TFile): string {
  if (!file) return "";
  return file.extension === "md" ? file.path.slice(0, -3) : file.path;
}





export const findTemplateFiles = async (
  app: App,
  dir: string,
) => {

  const locale = window.moment().locale()

  if (!app) {
    // TODO: add notice to indicate that the app or settings are not defined (only when debug mode is on)
    new Notice(
      I18N_MAP[locale][`${ERROR_MESSAGE}NO_TEMPLATE_EXIST`],
    );
    return [];
  }
  // Setting root dir for searching

  if (dir === "") return [];

  const folder = app.vault.getAbstractFileByPath(dir);

  console.log(folder)

  if (folder instanceof TFolder) {

    // DFS for all areas and sub-areas in the areas root folder
    const stack = [folder]
    const visited = new Set<TAbstractFile>()
    const result: TAbstractFile[] = []

    while (stack.length > 0) {
      const vertex = stack.pop()

      if (vertex !== undefined) {
        if (!visited.has(vertex)) {
          visited.add(vertex)


          if (vertex.children.length > 0) {
            const TemplateFile = vertex.children.sort().filter((file) => {
              if (file instanceof TFile) {
                return true;
              }
            });
            if (TemplateFile) {
              result.push(...TemplateFile)
            }

          }
          for (const neighbor of vertex.children.sort().filter((file) => file instanceof TFolder)) {
            stack.push(neighbor as TFolder);
          }
        }
      }
    }

    console.log(result)
    if (result.length === 0) {
      new Notice(
        I18N_MAP[locale][`${ERROR_MESSAGE}NO_TEMPLATE_EXIST`],
      );
    }
    return result



  }
}

// export class File {
//   app: App;
//   filename: string;
//   // tagPositions: string;
//   hasFrontMatter: boolean;
//   basename?: string
//   tagPositions: TagCache[]
//   constructor(app: App, filename: string, tagPositions: TagCache[], hasFrontMatter: boolean) {
//     this.app = app;
//     this.filename = filename;
//     this.basename = filename.split("/").pop();
//     this.tagPositions = tagPositions;
//     this.hasFrontMatter = !!hasFrontMatter;
//   }
//
//   /** @param {Replacement} replace */
//   async renamed(replace: Replacement) {
//     const file = this.app.vault.getAbstractFileByPath(this.filename);
//     if (!file) return;
//     const original = await this.app.vault.read(file as TFile);
//     let text = original;
//
//     for (const { position: { start, end }, tag } of this.tagPositions) {
//       if (text.slice(start.offset, end.offset) !== tag) {
//         const msg = `File ${this.filename} has changed; skipping`;
//         new Notice(msg);
//         console.error(msg);
//         console.debug(text.slice(start.offset, end.offset), tag);
//         return;
//       }
//       text = replace.inString(text, start.offset);
//     }
//
//     if (this.hasFrontMatter)
//       text = this.replaceInFrontMatter(text, replace) ?? "";
//
//     if (text === "") return;
//
//     if (text !== original) {
//       await this.app.vault.modify(file as TFile, text);
//       return true;
//     }
//   }
//
//   /** @param {Replacement} replace */
//   replaceInFrontMatter(text: string, replace: Replacement) {
//     const [empty, frontMatter] = text.split(/^---\r?$\n?/m, 2);
//
//     // Check for valid, non-empty, properly terminated front matter
//     if (empty.trim() !== "" || !frontMatter.trim() || !frontMatter.endsWith("\n"))
//       return text;
//
//     const parsed: any = parseDocument(frontMatter, { keepSourceTokens: true });
//     if (parsed.errors.length) {
//       const error = `YAML issue with ${this.filename}: ${parsed.errors[0]}`;
//       console.error(error); new Notice(error + "; skipping frontmatter");
//       return;
//     }
//
//     let changed = false, json = parsed.toJSON();
//
//     function setInNode(node: any, value: string, afterKey = false) {
//       if (node.srcToken) {
//         CST.setScalarValue(node.srcToken, value, { afterKey });
//         changed = true;
//         node.value = value;
//       }
//     }
//
//     function processField(prop: string, isAlias: boolean) {
//       const node: any = parsed.get(prop, true);
//       if (!node) return;
//       const field = json[prop];
//       if (!field || !field.length) return;
//       if (typeof field === "string") {
//         const parts = field.split(isAlias ? /(^\s+|\s*,\s*|\s+$)/ : /([\s,]+)/);
//         const after = replace.inArray(parts, true, isAlias).join("");
//         if (field != after) setInNode(node, after, true);
//       } else if (Array.isArray(field)) {
//         replace.inArray(field, false, isAlias).forEach((v, i) => {
//           if (field[i] !== v) setInNode(node.get(i, true), v)
//         });
//       }
//     }
//
//     if (!parsed.contents) return;
//
//     for (const { key: { value: prop } } of parsed.contents.items) {
//       if (/^tags?$/i.test(prop)) {
//         processField(prop, false);
//       } else if (/^alias(es)?$/i.test(prop)) {
//         processField(prop, true);
//       }
//     }
//
//     return changed && parsed.contents.srcToken ? text.replace(frontMatter, CST.stringify(parsed.contents.srcToken)) : text;
//   }
// }

export async function createFile(
  app: App,
  options: {
    locale: string;
    templateFile: string;
    folder: string;
    file: string;
    tag?: string;
    append?: string;
  },
) {
  if (!app) {
    return;
  }

  const { templateFile, folder, file, tag, locale } = options;
  const templateTFile = app.vault.getAbstractFileByPath(templateFile);

  if (!templateTFile) {
    return new Notice(
      I18N_MAP[locale][`${ERROR_MESSAGE}NO_TEMPLATE_EXIST`] + templateFile,
    );
  }

  if (templateTFile instanceof TFile) {
    let templateContent = await app.vault.cachedRead(templateTFile);


    if (options.append) {
      console.log(options.append)
      templateContent = templateContent + "\n\n---\n" + options.append
    }
    if (!folder || !file) {
      return;
    }

    const tFile = app.vault.getAbstractFileByPath(file);

    if (tFile && tFile instanceof TFile) {
      return await app.workspace.getLeaf().openFile(tFile);
    }

    if (!app.vault.getAbstractFileByPath(folder)) {
      app.vault.createFolder(folder);
    }

    const fileCreated = await app.vault.create(file, templateContent);

    await app.fileManager.processFrontMatter(fileCreated, (frontMatter) => {
      if (!tag) {
        return;
      }

      frontMatter.tags = frontMatter.tags || [];
      frontMatter.tags.push(tag.replace(/^#/, ""));
    });

    // await sleep(30); // 等待被索引，否则读取不到 frontmatter：this.app.metadataCache.getFileCache(file)
    await app.workspace.getLeaf().openFile(fileCreated);
  }
}
