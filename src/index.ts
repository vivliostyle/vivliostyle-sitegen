import { loadConfig } from './config';
import { createPages } from './pages';
import { copyAssets } from './assets';
import { transpileSass } from './sass';
import { watch } from './watch';

/**
 * Generate a static site from a Markdown files.
 * @param devMode - Run developer mode, preview and file monitoring will start.
 * @returns Success or failure of asynchronous tasks.
 */
export const ssg = async (devMode: boolean = false): Promise<void> => {
  const config = await loadConfig();
  await copyAssets(config.assetsDir, config.distDir);
  await transpileSass(config.sass);
  await createPages(config.pagesDir, config.distDir, config);

  if (devMode) {
    watch(config);
  }
};
