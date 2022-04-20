import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from '@vivliostyle/vfm';
import type { CreateMetadataOptions } from './markdown';
import { createMetadata } from './markdown';

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
 * Create the path of destination file.
 * @param srcFilePath - Path of the source file.
 * @param srcRootDir - Path of the source root directory.
 * @param destDirPath - Path of the destination root directory.
 * @param extname - Extension of the file to be changed. If not specified, the original extension will be used.
 * @returns Path of the destination file.
 */
export const createDestFilePath = (
  srcFilePath: string,
  srcRootDir: string,
  destDirPath: string,
  extname?: string,
) => {
  const subPath = path.relative(srcRootDir, srcFilePath);
  if (extname) {
    return path.join(
      destDirPath,
      path.dirname(subPath),
      `${path.basename(subPath, path.extname(subPath))}${extname}`,
    );
  } else {
    return path.join(destDirPath, subPath);
  }
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
  metadataOptions?: CreateMetadataOptions,
): Promise<Content> => {
  const markdown = await fs.readFile(markdownFilePath, 'utf-8');
  const htmlFilePath = createDestFilePath(
    markdownFilePath,
    pagesRootDir,
    destRootDir,
    '.html',
  );

  const metadata = createMetadata(
    markdown,
    path.dirname(htmlFilePath),
    metadataOptions,
  );

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
