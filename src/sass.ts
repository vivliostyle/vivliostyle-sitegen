import fs from 'node:fs/promises';
import sass from 'sass';
import { SassConfig } from './config';

/**
 * Transpile Sass/SCSS file to CSS.
 * @param src - Path of the Sass/SCSS file.
 * @param dest - Path of the transpiled CSS file.
 * @returns `true` on success, `false` otherwise.
 */
const transpile = async (src: string, dest: string): Promise<boolean> => {
  try {
    const result = sass.compile(src);
    await fs.writeFile(dest, result.css);
    console.log(`[CSS] ${dest}`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Transpile Sass/SCSS to CSS..
 * @param sassConfig - Configuration of the Sass/SCSS transpile to CSS.
 * @returns Asynchronous task.
 */
export const transpileSass = async (
  sassConfig: SassConfig[],
): Promise<void> => {
  for (const config of sassConfig) {
    await transpile(config.src, config.dest);
  }
};
