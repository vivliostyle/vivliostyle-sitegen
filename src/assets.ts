import path from 'node:path';
import fs from 'node:fs';

/**
 * Creates a directory with the specified path.
 * - If the specified directory exists, it will not be created and will be successful.
 * - If multiple non-existent hierarchies are specified, they are created recursively.
 * @param dir - Path of the target directory.
 * @returns `true` if successful or if the directory already exists, `false` otherwise.
 */
export const safeMkdir = (dir: string): boolean => {
  if (fs.existsSync(dir)) {
    return true;
  }

  fs.mkdirSync(dir, { recursive: true });
  return fs.existsSync(dir);
};

/**
 * Create the path of destination file.
 * If `destRootDir` is empty, returns the path relative to `srcFile` in `srcRootDir`.
 * @param srcFile - Path of the source file.
 * @param srcRootDir - Path of the source root directory.
 * @param destRootDir - Path of the destination root directory.
 * @param extname - Extension of the file to be changed. If not specified, the original extension will be used.
 * @returns Path of the destination file.
 */
export const createDestFilePath = (
  srcFile: string,
  srcRootDir: string,
  destRootDir: string,
  extname?: string,
): string => {
  const subDir = path.relative(srcRootDir, srcFile);
  if (extname) {
    return path.join(
      destRootDir,
      path.dirname(subDir),
      `${path.basename(subDir, path.extname(subDir))}${extname}`,
    );
  } else {
    return path.join(destRootDir, subDir);
  }
};

/**
 * Copy the file.
 * - If a file with the same name exists at the destination, it is overwritten.
 * - If the destination directory hierarchy does not exist, it will be created.
 * @param srcFile - Path of the source file.
 * @param srcRootDir - Path of the source root directory.
 * @param destRootDir - Path of the destination root directory.
 * @returns Path of the destination file.
 */
export const copyFile = async (
  srcFile: string,
  srcRootDir: string,
  destRootDir: string,
): Promise<string> => {
  try {
    const destFile = createDestFilePath(srcFile, srcRootDir, destRootDir);
    safeMkdir(path.dirname(destFile));
    await fs.promises.copyFile(srcFile, destFile);
    return destFile;
  } catch (err) {
    console.error(err);
    return '';
  }
};

/**
 * Delete file in the destination directory with paths corresponding to files in the specified source directory.
 * @param srcFile - Path of the source file.
 * @param srcRootDir - Path of the source root directory.
 * @param destRootDir - Path of the destination root directory.
 * @returns Path of the destination file.
 */
export const deleteFile = async (
  srcFile: string,
  srcRootDir: string,
  destRootDir: string,
): Promise<string> => {
  try {
    const targetFile = createDestFilePath(srcFile, srcRootDir, destRootDir);
    await fs.promises.unlink(targetFile);
    return targetFile;
  } catch (err) {
    console.error(err);
    return '';
  }
};

/**
 * Recursively copies files to the target directory, preserving the structure of the specified directory.
 * @param srcDir - Path of the static resource directory.
 * @param destDir - Path of the site destination directory.
 * @returns Asynchronous task.
 */
const copyFilesRecursive = async (
  srcDir: string,
  destDir: string,
): Promise<void> => {
  safeMkdir(destDir);

  const items = await fs.promises.readdir(srcDir);
  for (let i = 0; i < items.length; ++i) {
    const srcItemPath = path.join(srcDir, items[i]);
    const stat = await fs.promises.stat(srcItemPath);
    if (stat.isDirectory()) {
      copyFilesRecursive(srcItemPath, path.join(destDir, items[i]));
      continue;
    }

    await fs.promises.copyFile(srcItemPath, path.join(destDir, items[i]));
  }
};

/**
 * Copy the files from the static resource directory to the distribution directory.
 * @param srcDir - Path of the static resource directory.
 * @param destDir - Path of the site destination directory.
 * @returns Asynchronous task.
 */
export const copyAssets = async (
  srcDir: string,
  destDir: string,
): Promise<void> => {
  try {
    const stat = await fs.promises.stat(srcDir);
    if (stat.isDirectory()) {
      console.log(`[Assets] ${srcDir}`);
      copyFilesRecursive(srcDir, destDir);
    }
  } catch (err) {
    console.error(err);
  }
};
