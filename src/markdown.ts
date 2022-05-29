import path from 'node:path';
import ejs from 'ejs';
import type { Metadata, Attribute } from '@vivliostyle/vfm';
import { readMetadata, stringify } from '@vivliostyle/vfm';

/**
 * Placeholder that indicates a content part when processing HTML templates.
 * The replacement target is specified directly under `<body>` in HTML.
 */
const BODY_HTML_PLACEHOLDER = '4bd5d00d-52a6-12c5-7ba7-3b7ac0b352e6';

/**
 * Options of the creation metadata..
 */
export type CreateMetadataOptions = {
  /**
   * Path collection of CSS files referenced as relative paths from the page.
   */
  styleSheets?: string[];
  /**
   * Path collection of JavaScript files referenced as relative paths from the page.
   */
  scripts?: string[];
  /**
   * A collection of key names to be ignored by HTML processing in VFM frontmatter.
   * Keys specified here are not processed as HTML tags, but are stored in `custom` in `Metadata`.
   */
  customKeys?: string[];
};

/**
 * Parameters of `createMetadata`.
 */
export type CreateMetadataParams = CreateMetadataOptions & {
  /**
   * The directory of the HTML file on which the relative path is based.
   */
  baseDir?: string;
};

/**
 * Create `<link>` metadata of VFM.
 * @param baseDir - The directory of the HTML file on which the relative path is based.
 * @param stylesheets - Path collection of CSS files referenced as relative paths from the page.
 * @returns `<link>` metadata of VFM.
 */
const createStyleSheetsMetadata = (
  baseDir: string,
  stylesheets: string[],
): Array<Array<Attribute>> => {
  const result: Array<Array<Attribute>> = [];
  for (const filePath of stylesheets) {
    const dir = path.relative(baseDir, path.dirname(filePath));
    const hrefPath = path.join(dir, path.basename(filePath));
    const rel: Attribute = { name: 'rel', value: 'stylesheet' };
    const href: Attribute = { name: 'href', value: hrefPath };
    result.push([rel, href]);
  }

  return result;
};

/**
 * Create `<script>` metadata of VFM.
 * @param baseDir - The directory of the HTML file on which the relative path is based.
 * @param scripts - Path collection of JavaScript files referenced as relative paths from the page.
 * @returns `<script>` metadata of VFM.
 */
const createScriptsMetadata = (
  baseDir: string,
  scripts: string[],
): Array<Array<Attribute>> => {
  const result: Array<Array<Attribute>> = [];
  for (const filePath of scripts) {
    const dir = path.relative(baseDir, path.dirname(filePath));
    const srcPath = path.join(dir, path.basename(filePath));
    const type: Attribute = { name: 'type', value: 'text/javascript' };
    const src: Attribute = { name: 'src', value: srcPath };
    result.push([type, src]);
  }

  return result;
};

/**
 * Create metadata of VFM.
 * @param markdown - Markdown string.
 * @param baseDir - The directory of the HTML file on which the relative path is based.
 * @param options - Options.
 * @returns Metadata.
 */
export const createMetadata = (
  markdown: string,
  {
    baseDir = undefined,
    styleSheets = [],
    scripts = [],
    customKeys = undefined,
  }: CreateMetadataParams = {},
): Metadata => {
  const metadata = readMetadata(markdown, customKeys);
  if (baseDir) {
    const linksMetadata = createStyleSheetsMetadata(baseDir, styleSheets);
    if (0 < linksMetadata.length) {
      metadata.link = metadata.link
        ? [...metadata.link, ...linksMetadata]
        : linksMetadata;
    }

    const scriptsMetadata = createScriptsMetadata(baseDir, scripts);
    if (0 < scriptsMetadata.length) {
      metadata.script = metadata.script
        ? [...metadata.script, ...scriptsMetadata]
        : scriptsMetadata;
    }
  }

  return metadata;
};

/**
 * Create HTML from Markdown and parameters.
 *
 * The following parameters are specified in the EJS `template`.
 * - `metadata`: The `metadata` argument specified for this function.
 * - `site`: The `site` argument specified for this function.
 * - `html`: HTML created from Markdown text.
 * @param markdown - Markdown string.
 * @param metadata - Metadata of VFM.
 * @param template - Template string of EJS.
 * @param site - User data of the web site.
 */
export const createHtml = (
  markdown: string,
  metadata: Metadata,
  template: string = '',
  site: object = {},
): string => {
  if (template) {
    const pageHtml = stringify(BODY_HTML_PLACEHOLDER, {}, metadata);
    const bodyHtml = ejs.render(template, {
      metadata,
      site,
      html: stringify(markdown, { partial: true }),
    });

    return pageHtml.replace(`<p>${BODY_HTML_PLACEHOLDER}</p>`, bodyHtml);
  }

  return stringify(markdown, {}, metadata);
};
