import path from 'node:path';
import fs from 'node:fs/promises';
import { safeMkdir } from './util';

/**
 * Recursively copies files to the target directory, preserving the structure of the specified directory.
 * @param src - Path of the source directory.
 * @param dist - Path of the site distribution directory.
 */
const copyFilesRecursive = async (src: string, dist: string) => {
  safeMkdir(dist);

  const items = await fs.readdir(src);
  for (let i = 0; i < items.length; ++i) {
    const srcItemPath = path.join(src, items[i]);
    const stat = await fs.stat(srcItemPath);
    if (stat.isDirectory()) {
      copyFilesRecursive(srcItemPath, path.join(dist, items[i]));
      continue;
    }

    const copyFilePath = path.join(dist, items[i]);
    await fs.copyFile(srcItemPath, copyFilePath);
  }
};

/**
 * Copy the files from the static resource directory to the distribution directory.
 * @param src - Path of the static resource directory.
 * @param dist - Path of the site distribution directory.
 */
export const copyAssets = async (src: string, dist: string) => {
  // Do nothing if the resource directory must exist.
  try {
    const stat = await fs.stat(src);
    if (stat.isDirectory()) {
      console.log(`[Assets] ${src}`);
      copyFilesRecursive(src, dist);
    }
  } catch (err) {
    console.error(err);
  }
};
