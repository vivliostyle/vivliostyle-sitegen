import path from 'node:path';
import fs from 'node:fs';
import chokidar from 'chokidar';
import browserSync from 'browser-sync';
import { Config } from './config';
import { createHtmlFile } from './pages';
import { transpileSass } from './sass';
import { createDestFilePath } from './util';

/**
 * Copy the file.
 * @param srcItemPath - Path of the source file.
 * @param srcRootDir - Path of the source root directory.
 * @param destDirPath - Path of the destination root directory.
 */
const copyFile = (
  srcItemPath: string,
  srcRootDir: string,
  destRootDir: string,
) => {
  const destFilePath = createDestFilePath(srcItemPath, srcRootDir, destRootDir);
  fs.copyFileSync(srcItemPath, destFilePath);
};

/**
 * Create the content from source file.
 * If it is a directory, it will not process anything.
 * @param srcItemPath - Path of the source file or directory.
 * @param configs - Configuration of the Sass/SCSS/CSS..
 */
const createContent = (srcItemPath: string, config: Config) => {
  const stat = fs.statSync(srcItemPath);
  if (stat.isDirectory()) {
    return;
  }

  switch (path.extname(srcItemPath)) {
    case '.md':
      createHtmlFile(
        srcItemPath,
        createDestFilePath(
          srcItemPath,
          config.pagesDir,
          config.distDir,
          '.html',
        ),
        config,
      );
      break;

    default:
      copyFile(srcItemPath, config.pagesDir, config.distDir);
      break;
  }
};

/**
 * Watch fot the pages root directory.
 * @param config - Configuration of the application and user.
 */
const watchPages = (config: Config) => {
  chokidar
    .watch(path.join(config.pagesDir, '**', '*.*'), { ignoreInitial: true })
    .on('add', (item) => {
      createContent(item, config);
      browserSync.reload();
    })
    .on('change', (item) => {
      createContent(item, config);
      browserSync.reload();
    });
};

/**
 * Watch fot the Sass/SCSS root directory.
 * @param config - Configuration of the application and user.
 */
const watchScss = (config: Config) => {
  chokidar
    .watch(path.join(config.sassDir, '**', '*.*'), {
      ignoreInitial: true,
    })
    .on('add', () => {
      transpileSass(config.sass);
      browserSync.reload();
    })
    .on('change', () => {
      transpileSass(config.sass);
      browserSync.reload();
    });
};

/**
 * Watch for changes in the specified directory and takes action.
 * @param config - Configuration of the application and user.
 */
export const watch = async (config: Config) => {
  console.log(`[Watch] ${config.srcRootDir}`);

  browserSync.init({ server: config.distDir });
  watchPages(config);
  watchScss(config);
};
