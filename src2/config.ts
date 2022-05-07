import path from 'node:path';

/**
 * User-defined configurations of the vivliostyle-sitegen.
 */
export type UserConfig = {
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
};

/**
 * Configuration of the vivliostyle-sitegen.
 */
export type Config = {
  /**
   * Path of the page files (Markdown, ...etc) directory.
   */
  pagesDir: string;
  /**
   * Path of the static resource directory.
   */
  assetsDir: string;
  /**
   * Path of the destination (site distribution) directory.
   */
  destDir: string;
  /**
   * User-defined configurations of the vivliostyle-sitegen.
   */
  userConfig: UserConfig;
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
 * Loads user-defined configurations.
 * @param configFile - Path of the configuration file.
 * @returns Configurations.
 */
const loadUserConfig = (configFile: string): UserConfig => {
  const config: UserConfig = {
    site: {},
    styleSheets: [],
    scripts: [],
    customKeys: [],
  };

  try {
    const data = require(configFile);
    if (typeof data.site === 'object') {
      config.site = data.site;
    }

    config.styleSheets = praseStringArray(data.styleSheets);
    config.scripts = praseStringArray(data.scripts);
    config.customKeys = praseStringArray(data.customKeys);
  } catch {
    // If `require` fails, returns default value and does nothing.
  }

  return config;
};

/**
 * Load the configuration.
 * @param appRootDir - Path of the client application root directory.
 * @returns Configuration.
 */
export const loadConfig = (appRootDir: string): Config => {
  const resolvedRootDir = path.resolve(appRootDir);
  const srcRootDir = path.join(resolvedRootDir, 'src');
  const userConfig = loadUserConfig(
    path.join(resolvedRootDir, 'vivliostyle.sitegen.js'),
  );

  return {
    pagesDir: path.join(srcRootDir, 'pages'),
    assetsDir: path.join(srcRootDir, 'assets'),
    destDir: path.join(appRootDir, 'public'),
    userConfig,
  };
};
