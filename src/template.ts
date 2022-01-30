import fs from 'node:fs/promises';
import path from 'node:path';
import ejs from 'ejs';
import { Metadata } from '@vivliostyle/vfm';

/** File extension of EJS template. */
const EXT_EJS = '.ejs';

/** Value of templates. key = type (from file name), value = string of EJS template. */
export type Template = {
  [key: string]: string;
};

/**
 * Load the template files.
 * @param dir - Path of the templates root directory.
 * @returns Information of the templates.
 */
export const loadTemplates = async (dir: string): Promise<Template> => {
  const templates: Template = {};
  const items = await fs.readdir(dir);
  for (const item of items) {
    if (!item.endsWith(EXT_EJS)) {
      continue;
    }

    const itemPath = path.join(dir, item);
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory()) {
      continue;
    }

    const type = path.basename(item, EXT_EJS);
    templates[type] = await fs.readFile(itemPath, 'utf-8');
  }

  return templates;
};

/**
 * Generates an HTML string from the specified page information and template.
 * @param template - Template string of EJS.
 * @param html - HTML string of page.
 * @param metadata - Metadata of page frontmatter.
 * @param site - Metadata of Web site in `vivliostyle.sitegen.js`.
 * @returns HTML string processed by the template.
 */
export const htmlWithTemplate = (
  template: string,
  html: string,
  metadata: Metadata,
  site: any,
): string => {
  return ejs.render(template, { html, metadata, site });
};
