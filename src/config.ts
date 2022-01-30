import path from 'path';
import fs from 'fs';
import { Template, loadTemplates } from './template';

/** Configuration of the Sass/SCSS transpile to CSS. */
export type SassConfig = {
  /** Path of the Sass/SCSS file. */
  src: string;
  /** Path of the transpiled CSS file. */
  dest: string;
};

/** Configuration of the vivliostyle-ssg. */
export type Config = {
  /** Path of the source root directory. */
  srcRootDir: string;
  /** Path of the page files (Markdown, ...etc) directory. */
  pagesDir: string;
  /** Path of the static resource directory. */
  assetsDir: string;
  /** Path of the Sass/SCSS files directory. */
  sassDir: string;
  /** Path of the site distribution directory. */
  distDir: string;
  /** Value of templates. key = type (from file name), value = string of EJS template. */
  templates: Template;
  /** Configuration of the Sass/SCSS transpile to CSS. */
  sass: SassConfig[];
  /** Relative path of files to be processed as `<link>` in HTML. */
  link: string[];
  /** Relative path of files to be processed as `<script>` in HTML. */
  script: string[];
  /** User data of the web site. */
  site: object;
};

/**
 * Check that the directory exists.
 * @param path - Path of the target directory.
 * @returns `true` if it exists, `false` otherwise.
 */
const existsDir = (path: string): Boolean => {
  if (fs.existsSync(path)) {
    const stat = fs.statSync(path);
    return stat.isDirectory();
  }

  return false;
};

/**
 * Parse the Sass/SCSS configuration.
 * @param value - Any value.
 * @param sassDir - Path of the Sass/SCSS files directory.
 * @param distDir - Path of the site distribution directory.
 * @returns Configuration.
 */
const parseSassConfigValue = (
  value: any,
  sassDir: string,
  distDir: string,
): SassConfig => {
  if (typeof value.src === 'string' && typeof value.dest === 'string') {
    return {
      src: path.join(sassDir, value.src),
      dest: path.join(distDir, value.dest),
    };
  }

  throw new Error('The element type of the "sass" array value is invalid.');
};

/**
 * Parse the Sass/SCSS configuration.
 * @param userScssConfig - User configuration.
 * @param sassDir - Path of the Sass/SCSS files directory.
 * @param distDir - Path of the site distribution directory.
 * @returns Configuration.
 */
const parseSassConfig = (
  userSassConfig: any,
  sassDir: string,
  distDir: string,
): SassConfig[] => {
  const sassConfig: SassConfig[] = [];
  if (!Array.isArray(userSassConfig)) {
    return sassConfig;
  }

  for (const config of userSassConfig) {
    try {
      const ret = parseSassConfigValue(config, sassDir, distDir);
      sassConfig.push(ret);
    } catch (err) {
      console.error(err);
      console.log(config);
    }
  }

  return sassConfig;
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
 * Merge the default config with the user config.
 * @param config - Original config.
 * @param filePath - Path of the user config file.
 * @returns Merged config.
 */
const mergeConfigFromFile = (config: Config, filePath: string): Config => {
  if (!fs.existsSync(filePath)) {
    return config;
  }

  const userConfig = require(filePath);
  if (typeof userConfig.site === 'object') {
    config.site = userConfig.site;
  }

  config.sass = parseSassConfig(
    userConfig.sass,
    config.sassDir,
    config.distDir,
  );

  config.link = praseStringArray(userConfig.link);
  config.script = praseStringArray(userConfig.script);

  return config;
};

/**
 * Load the configuration.
 * @returns Configuration.
 */
export const loadConfig = async (): Promise<Config> => {
  const appRootDir = process.cwd();
  const srcRootDir = path.join(appRootDir, 'src');
  const config: Config = {
    srcRootDir,
    pagesDir: path.join(srcRootDir, 'pages'),
    assetsDir: path.join(srcRootDir, 'assets'),
    sassDir: path.join(srcRootDir, 'sass'),
    distDir: path.join(appRootDir, 'public'),
    templates: await loadTemplates(path.join(srcRootDir, 'templates')),
    sass: [],
    link: [],
    script: [],
    site: {},
  };

  if (!existsDir(config.pagesDir)) {
    throw new Error(
      'The "./src/pages/" directory does not exist at the root of the application.',
    );
  }

  if (!existsDir(config.distDir)) {
    fs.mkdirSync(config.distDir, { recursive: true });
    if (!existsDir(config.distDir)) {
      throw new Error(
        'Created because "./public/" does not exist in the root of the application, but failed.',
      );
    }
  }

  const configFilePath = path.join(appRootDir, 'vivliostyle.sitegen.js');
  return mergeConfigFromFile(config, configFilePath);
};
