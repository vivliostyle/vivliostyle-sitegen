import path from 'node:path';
import chokidar from 'chokidar';
import browserSync from 'browser-sync';
import type { Config, CssConfig } from './config';
import type { Content } from './content';
import type { CreatePage, CreatePages } from './page';
import { transpileCssWithSave } from './css';
import { copyFile, deleteFile } from './assets';
import { createContent } from './content';

/**
 * Parameters for `watch` function.
 */
export type WatchParams = {
  /**
   * Contents.
   */
  contents: Content[];
  /**
   * Function to create pages.
   * Pages are output as HTML files by specifying data processed by a function implementing `CreatePages`.
   */
  createPage: CreatePage;
  /**
   * Create pages from content information.
   */
  createPages: CreatePages;
  /**
   * Configuration of the vivliostyle-sitegen.
   */
  config: Config;
};

/**
 * Collection of content that is increased, decreased, or updated by watch.
 */
let cacheContents: Content[] = [];

/**
 * Watch for changes in the AltCSS directory and takes action.
 * @param config - Configuration of the transpile AltCSS file to CSS.
 */
const watchCss = (config: CssConfig) => {
  chokidar
    .watch(path.join(path.dirname(config.src), '**', '*.*'), {
      ignoreInitial: true,
    })
    .on('all', () => {
      transpileCssWithSave(config.type, config.src, config.dest);
      console.log(`[CSS] Transpiled: "${config.dest}"`);
      browserSync.reload();
    });
};

/**
 * Watch for changes in the assets directory and takes action.
 * @param srcAssetsDir - Path of the assets (static resource) directory.
 * @param destDir - Path of the destination (site distribution) directory.
 */
const watchAssets = (srcAssetsDir: string, destDir: string) => {
  chokidar
    .watch(path.join(path.dirname(srcAssetsDir), '**', '*.*'), {
      ignoreInitial: true,
    })
    .on('add', async (itemPath) => {
      const copiedFile = await copyFile(itemPath, srcAssetsDir, destDir);
      console.log(`[Assets] Copied: "${copiedFile}"`);
      browserSync.reload();
    })
    .on('change', async (itemPath) => {
      const copiedFile = await copyFile(itemPath, srcAssetsDir, destDir);
      console.log(`[Assets] Copied: "${copiedFile}"`);
      browserSync.reload();
    })
    .on('unlink', async (itemPath) => {
      const deletedFile = await deleteFile(itemPath, srcAssetsDir, destDir);
      console.log(`[Assets] Deleted: "${deletedFile}"`);
      browserSync.reload();
    });
};

/**
 * Handles file addition related to pages.
 * @param filePath - Path of the added file.
 * @param srcContents - Contents.
 * @param createPage - Function to create pages. Pages are output as HTML files by specifying data processed by a function implementing `CreatePages`.
 * @param createPages - Create pages from content information.
 * @param config - Configuration of the vivliostyle-sitegen.
 */
const addPageItem = async (
  filePath: string,
  srcContents: Content[],
  createPage: CreatePage,
  createPages: CreatePages,
  config: Config,
): Promise<Content[]> => {
  if (!filePath.endsWith('.md')) {
    await copyFile(filePath, config.srcPagesDir, config.destDir);
    return srcContents;
  }

  const contents = [...srcContents];
  contents.push(
    await createContent(filePath, config.srcPagesDir, config.destDir, config),
  );
  return createPages({ contents, createPage });
};

/**
 * Handles file update related to pages.
 * @param filePath - Path of the added file.
 * @param srcContents - Contents.
 * @param createPage - Function to create pages. Pages are output as HTML files by specifying data processed by a function implementing `CreatePages`.
 * @param createPages - Create pages from content information.
 * @param config - Configuration of the vivliostyle-sitegen.
 */
const updatePageItem = async (
  filePath: string,
  srcContents: Content[],
  createPage: CreatePage,
  createPages: CreatePages,
  config: Config,
): Promise<Content[]> => {
  if (!filePath.endsWith('.md')) {
    await copyFile(filePath, config.srcPagesDir, config.destDir);
    return srcContents;
  }

  const contents = [...srcContents];
  for (let i = 0; i < contents.length; ++i) {
    if (filePath === contents[i].markdownFilePath) {
      contents[i] = await createContent(
        filePath,
        config.srcPagesDir,
        config.destDir,
        config,
      );
      break;
    }
  }

  return createPages({ contents, createPage });
};

/**
 * Handles file deletion related to pages.
 * @param filePath - Path of the added file.
 * @param srcContents - Contents.
 * @param createPage - Function to create pages. Pages are output as HTML files by specifying data processed by a function implementing `CreatePages`.
 * @param createPages - Create pages from content information.
 * @param config - Configuration of the vivliostyle-sitegen.
 */
const deletePageItem = async (
  filePath: string,
  srcContents: Content[],
  createPage: CreatePage,
  createPages: CreatePages,
  config: Config,
): Promise<Content[]> => {
  if (!filePath.endsWith('.md')) {
    await deleteFile(filePath, config.srcPagesDir, config.destDir);
    return srcContents;
  }

  const contents = [...srcContents];
  for (let i = 0; i < contents.length; ++i) {
    if (filePath === contents[i].markdownFilePath) {
      contents.splice(i, 1);
      break;
    }
  }

  return createPages({ contents, createPage });
};

/**
 * Watch for changes in the pages directory and takes action.
 * @param contents - Contents.
 * @param createPage - Function to create pages. Pages are output as HTML files by specifying data processed by a function implementing `CreatePages`.
 * @param createPages - Create pages from content information.
 * @param config - Configuration of the vivliostyle-sitegen.
 */
const watchPages = (
  contents: Content[],
  createPage: CreatePage,
  createPages: CreatePages,
  config: Config,
) => {
  // To avoid side-effects on arguments, copied content is subject to update by watch
  cacheContents = [...contents];

  chokidar
    .watch(path.join(config.srcPagesDir, '**', '*.*'), {
      ignoreInitial: true,
    })
    .on('add', async (filePath) => {
      cacheContents = await addPageItem(
        filePath,
        cacheContents,
        createPage,
        createPages,
        config,
      );
      browserSync.reload();
    })
    .on('change', async (filePath) => {
      cacheContents = await updatePageItem(
        filePath,
        cacheContents,
        createPage,
        createPages,
        config,
      );
      browserSync.reload();
    })
    .on('unlink', async (filePath) => {
      cacheContents = await deletePageItem(
        filePath,
        cacheContents,
        createPage,
        createPages,
        config,
      );
      browserSync.reload();
    });
};

/**
 * Watch for changes in the specified directory and takes action.
 * @param params - Parameters.
 */
export const watch = ({
  contents,
  createPage,
  createPages,
  config,
}: WatchParams) => {
  console.log('[Watch]');

  browserSync.init({ server: config.destDir });

  watchPages(contents, createPage, createPages, config);
  watchAssets(config.srcAssetsDir, config.destDir);

  if (config.css) {
    watchCss(config.css);
  }
};
