import path from 'node:path';
import fs from 'node:fs/promises';
import { safeMkdir } from './util';
import { stringify, readMetadata, Metadata, Attribute } from '@vivliostyle/vfm';
import { Template, htmlWithTemplate } from './template';

/** Placeholder that indicates a content part when processing HTML templates. */
const CONTENT_PLACEHOLDER = '4bd5d00d-52a6-12c5-7ba7-3b7ac0b352e6';

/** Options of creation page. */
export type PageOptions = {
  /** Value of templates. key = type (from file name), value = string of EJS template. */
  templates: Template;
  /** Relative path collection of files to be processed as `<link>` in HTML. */
  link: string[];
  /** Relative path collection of files to be processed as `<link>` in HTML. */
  script: string[];
  /** User data of the web site. */
  site: object;
};

/**
 * Create a page title from metadata and site settings.
 * @param metadata - Metadata from Markdown.
 * @param site - Site settings.
 * @returns Title string. If failed, empty string.
 */
const createTitle = (metadata: Metadata, site: any): string => {
  if (site && typeof site.title === 'string') {
    if (metadata.title) {
      return `${metadata.title} - ${site.title}`;
    } else {
      return site.title;
    }
  }

  return metadata.title || '';
};

/**
 * Create `<link>` metadata of VFM.
 * @param dist - Path of the distribution directory.
 * @param linkConfig - Path collection of files to be processed as `<link>` in HTML.
 * @returns `<link>` metadata of VFM.
 */
const createLinkMetadata = (
  linkConfig: string[],
  dist: string,
): Array<Array<Attribute>> => {
  const result: Array<Array<Attribute>> = [];
  for (const filePath of linkConfig) {
    const dir = path.relative(path.dirname(dist), path.dirname(filePath));
    const hrefPath = path.join(dir, path.basename(filePath));
    const rel: Attribute = { name: 'rel', value: 'stylesheet' };
    const href: Attribute = { name: 'href', value: hrefPath };
    result.push([rel, href]);
  }

  return result;
};

/**
 * Create `<script>` metadata of VFM.
 * @param dist - Path of the distribution directory.
 * @param linkConfig - Path collection of files to be processed as `<link>` in HTML.
 * @returns `<script>` metadata of VFM.
 */
const createScriptMetadata = (
  scriptConfig: string[],
  dist: string,
): Array<Array<Attribute>> => {
  const result: Array<Array<Attribute>> = [];
  for (const filePath of scriptConfig) {
    const dir = path.relative(path.dirname(dist), path.dirname(filePath));
    const srcPath = path.join(dir, path.basename(filePath));
    const type: Attribute = { name: 'type', value: 'text/javascript' };
    const src: Attribute = { name: 'src', value: srcPath };
    result.push([type, src]);
  }

  return result;
};

/**
 * Create metadata by HTML page.
 * @param md - Markdown string.
 * @param htmlPath - Path of the HTML file.
 * @param options - Options of creation page.
 * @returns Metadata.
 */
const createMetadata = (
  md: string,
  htmlPath: string,
  options: PageOptions,
): Metadata => {
  const metadata = readMetadata(md);

  const title = createTitle(metadata, options.site);
  if (title) {
    metadata.title = title;
  }

  const link = createLinkMetadata(options.link, htmlPath);
  if (0 < link.length) {
    if (metadata.link) {
      metadata.link = [...metadata.link, ...link];
    } else {
      metadata.link = link;
    }
  }

  const script = createScriptMetadata(options.script, htmlPath);
  if (0 < script.length) {
    if (metadata.script) {
      metadata.script = [...metadata.script, ...script];
    } else {
      metadata.script = script;
    }
  }

  return metadata;
};

/**
 * Select the template file that matches page.
 * @param metadata - Metadata of page.
 * @param templates - Templates of EJS.
 * @returns Template file path on success, otherwise an empty string.
 */
const selectTemplate = (metadata: Metadata, templates: Template) => {
  // TODO: Plan to branch templates by metadata
  if (templates['index']) {
    return templates['index'];
  }

  return '';
};

/**
 * Create HTML file from Markdown file.
 * @param src - Path of the Markdown file.
 * @param dist - Path of the distribution directory.
 * @param options - Options of creation page.
 */
export const createHtmlFile = async (
  src: string,
  dest: string,
  options: PageOptions,
) => {
  const md = await fs.readFile(src, 'utf-8');
  const metadata = createMetadata(md, dest, options);
  const template = selectTemplate(metadata, options.templates);
  if (template) {
    const baseHtml = stringify(CONTENT_PLACEHOLDER, {}, metadata);
    const contentHtml = htmlWithTemplate(
      template,
      stringify(md, { partial: true }),
      metadata,
      options.site,
    );

    const html = baseHtml.replace(CONTENT_PLACEHOLDER, contentHtml);
    await fs.writeFile(dest, html, 'utf-8');
  } else {
    const html = stringify(md, {}, metadata);
    await fs.writeFile(dest, html, 'utf-8');
  }

  console.log(`[HTML] ${dest}`);
};

/**
 * Create pages from source directory.
 * @param srcDir - Path of the source directory.
 * @param distDir - Path of the distribution directory.
 * @param options - Options of creation page.
 */
export const createPages = async (
  srcDir: string,
  distDir: string,
  options: PageOptions,
) => {
  safeMkdir(distDir);

  const items = await fs.readdir(srcDir);
  for (let i = 0; i < items.length; ++i) {
    const srcItemPath = path.join(srcDir, items[i]);
    const stat = await fs.stat(srcItemPath);
    if (stat.isDirectory()) {
      await createPages(srcItemPath, path.join(distDir, items[i]), options);
    } else if (path.extname(srcItemPath) === '.md') {
      await createHtmlFile(
        srcItemPath,
        path.join(distDir, `${path.basename(srcItemPath, '.md')}.html`),
        options,
      );
    } else {
      const copyFilePath = path.join(distDir, items[i]);
      await fs.copyFile(srcItemPath, copyFilePath);
    }
  }
};
