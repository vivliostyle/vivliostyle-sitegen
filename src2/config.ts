import path from 'node:path';
import fs from 'node:fs';
import type { CssType } from './css';

/**
 * Configuration of the transpile AltCSS file to CSS.
 */
export type CssConfig = {
  /**
   * Type of CSS engine.
   */
  type: CssType;
  /**
   * Path of the AltCSS file.
   */
  src: string;
  /**
   * Path of the transpiled CSS file.
   * Specify a path relative to the destination (site distribution) directory.
   */
  dest: string;
};

/**
 * Configuration of the vivliostyle-sitegen.
 */
export type Config = {
  /**
   * Path of the page files (Markdown, ...etc) directory.
   */
  srcPagesDir: string;
  /**
   * Path of the assets (static resource) directory.
   */
  srcAssetsDir: string;
  /**
   * Path of the destination (site distribution) directory.
   */
  destDir: string;
  /**
   * User data of the web site.
   */
  site: object;
  /**
   * Path collection of CSS files referenced as relative paths from the page.
   */
  styleSheets: string[];
  /**
   * Path collection of JavaScript files referenced as relative paths from the page.
   */
  scripts: string[];
  /**
   * A collection of key names to be ignored by HTML processing in VFM frontmatter.
   * Keys specified here are not processed as HTML tags, but are stored in `custom` in `Metadata`.
   */
  customKeys: string[];
  /**
   * Configuration for transpile CSS.
   */
  css?: CssConfig;
};

/**
 * Parses the string array.
 * @param values - Any value.
 * @returns String array.
 */
const praseStringArray = (values: any): string[] => {
  const result: string[] = [];
  if (!Array.isArray(values)) {
    return result;
  }

  for (const value of values) {
    if (typeof value === 'string') {
      result.push(value);
    }
  }

  return result;
};

/**
 * Check the CSS config.
 * @param value - Value from user data.
 * @returns Checked value. If the value is invalid, it is `undefined`.
 */
const checkCssConfig = (value: any): CssConfig | undefined => {
  return typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.src === 'string' &&
    typeof value.dest === 'string'
    ? (value as CssConfig)
    : undefined;
};

/**
 * Resolves the specified value as the path to the appropriate directory.
 * @param baseDir - Path of the base directory.
 * @param value - Value from user data.
 * @param defaultDir - Path of the default directory.
 * @returns Resolved path.
 */
const resolveDirPath = (baseDir: string, value: any, defaultDir: string) => {
  if (typeof value === 'string' && value !== '') {
    return path.resolve(path.join(baseDir, value));
  }

  return defaultDir;
};

/**
 * Load the configuration.
 * @param configFile - Path of the configuration file.
 * @returns Configuration.
 */
export const loadConfig = (configFile: string): Config => {
  const config: Config = {
    srcPagesDir: path.join(process.cwd(), 'src', 'pages'),
    srcAssetsDir: path.join(process.cwd(), 'src', 'assets'),
    destDir: path.join(process.cwd(), 'public'),
    site: {},
    styleSheets: [],
    scripts: [],
    customKeys: [],
  };

  try {
    // Explicit file checking avoids unexpected `require` execution with implicit path resolution.
    const resolveFilePath = path.resolve(configFile);
    const stat = fs.statSync(resolveFilePath);
    if (!stat.isFile()) {
      return config;
    }

    const userConfig = require(resolveFilePath);
    const appRootDir = path.dirname(resolveFilePath);

    config.srcPagesDir = resolveDirPath(
      appRootDir,
      userConfig.srcPagesDir,
      config.srcPagesDir,
    );
    config.srcAssetsDir = resolveDirPath(
      appRootDir,
      userConfig.srcAssetsDir,
      config.srcAssetsDir,
    );
    config.destDir = resolveDirPath(
      appRootDir,
      userConfig.destDir,
      config.destDir,
    );
    config.site = typeof userConfig.site === 'object' ? userConfig.site : {};
    config.styleSheets = praseStringArray(userConfig.styleSheets);
    config.scripts = praseStringArray(userConfig.scripts);
    config.customKeys = praseStringArray(userConfig.customKeys);

    const css = checkCssConfig(userConfig.css);
    if (css) {
      config.css = css;
    }
  } catch {
    console.log('No configuration file exists, so default values are used.');
  }

  return config;
};
