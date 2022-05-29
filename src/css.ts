import fs from 'node:fs';
import sass from 'sass';

/**
 * Type of CSS engine.
 */
export type CssType = 'sass';

/**
 * Transpile Sass/SCSS file to CSS.
 * @param src - Path of the Sass/SCSS file.
 * @returns CSS string on success, empty string otherwise.
 */
const transpileSass = (src: string): string => {
  try {
    const result = sass.compile(src);
    return result.css;
  } catch (err) {
    console.error(err);
    return '';
  }
};

/**
 * Transpile AltCSS file to CSS.
 * @param type - Type of CSS engine.
 * @param src - Path of the AltCSS file.
 * @returns CSS string on success, empty string otherwise.
 */
export const transpileCss = (type: CssType, src: string): string => {
  switch (type) {
    case 'sass':
      return transpileSass(src);

    default:
      return '';
  }
};

/**
 * Transpile AltCSS to CSS and output to file.
 * @param type - Type of CSS engine.
 * @param src - Path of the AltCSS file.
 * @param dest - Path of the destination CSS file..
 * @returns CSS string on success, empty string otherwise.
 */
export const transpileCssWithSave = async (
  type: CssType,
  src: string,
  dest: string,
): Promise<boolean> => {
  try {
    const css = transpileCss(type, src);
    if (css === '') {
      return false;
    }

    await fs.promises.writeFile(dest, css);
    return true;
  } catch {
    return false;
  }
};
