import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from '@vivliostyle/vfm';
import type { CreateMetadataOptions } from './markdown';
import { createMetadata } from './markdown';
import { createDestFilePath, copyFile } from './assets';

/**
 * Content of the page.
 */
export type Content = {
  /**
   * Path of the source Markdown file.
   */
  markdownFilePath: string;
  /**
   * Path of the destination HTML file.
   */
  htmlFilePath: string;
  /**
   * Metadata of the page.
   */
  metadata: Metadata;
  /**
   * Markdown of the page.
   */
  markdown: string;
};

/**
 * Create content from the Markdown file.
 * @param markdownFilePath - Path of the source Markdown file.
 * @param pagesRootDir - Path of the source pages root directory.
 * @param destRootDir - Path of the destination root directory.
 * @param metadataOptions - Options of a metadata creation.
 * @returns Content.
 */
export const createContent = async (
  markdownFilePath: string,
  pagesRootDir: string,
  destRootDir: string,
  metadataOptions: CreateMetadataOptions = {},
): Promise<Content> => {
  const markdown = await fs.readFile(markdownFilePath, 'utf-8');
  const htmlFilePath = createDestFilePath(
    markdownFilePath,
    pagesRootDir,
    destRootDir,
    '.html',
  );
  const metadata = createMetadata(markdown, {
    baseDir: path.dirname(htmlFilePath),
    styleSheets: metadataOptions.styleSheets || undefined,
    scripts: metadataOptions.scripts || undefined,
    customKeys: metadataOptions.customKeys || undefined,
  });

  return {
    markdownFilePath,
    htmlFilePath,
    metadata,
    markdown,
  };
};

/**
 * Create content from the source directory and files.
 * @param parentDir - Path of the parent source directory.
 * @param pagesRootDir - Path of the source pages root directory.
 * @param destRootDir - Path of the destination root directory.
 * @param metadataOptions - Options of a metadata creation.
 * @returns Contents
 */
const createContentsRecursive = async (
  parentDir: string,
  pagesRootDir: string,
  destRootDir: string,
  metadataOptions?: CreateMetadataOptions,
): Promise<Content[]> => {
  const items = await fs.readdir(parentDir);
  let contents: Content[] = [];

  for (let item of items) {
    const itemPath = path.join(parentDir, item);
    const stat = await fs.stat(itemPath);

    if (stat.isDirectory()) {
      const results = await createContentsRecursive(
        itemPath,
        pagesRootDir,
        destRootDir,
        metadataOptions,
      );
      contents = [...contents, ...results];
    } else if (path.extname(item) === '.md') {
      contents.push(
        await createContent(
          itemPath,
          pagesRootDir,
          destRootDir,
          metadataOptions,
        ),
      );
    } else {
      await copyFile(itemPath, pagesRootDir, destRootDir);
    }
  }

  return contents;
};

/**
 * Create content from the source directory and files.
 * @param pagesRootDir - Path of the source pages root directory.
 * @param destRootDir - Path of the destination root directory.
 * @param metadataOptions - Options of a metadata creation.
 * @returns Contents
 */
export const createContents = async (
  pagesRootDir: string,
  destRootDir: string,
  metadataOptions?: CreateMetadataOptions,
): Promise<Content[]> => {
  return createContentsRecursive(
    pagesRootDir,
    pagesRootDir,
    destRootDir,
    metadataOptions,
  );
};
