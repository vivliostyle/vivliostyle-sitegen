import path from 'node:path';
import fs from 'node:fs';

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
 * Creates a directory with the specified path.
 * If the specified directory exists, it will not be created and will be successful.
 * @param dir - Path of the target directory.
 * @returns `true` if successful or if the directory already exists, `false` otherwise.
 */
export const safeMkdir = (dir: string) => {
  if (fs.existsSync(dir)) {
    return true;
  }

  fs.mkdirSync(dir);
  return fs.existsSync(dir);
};
