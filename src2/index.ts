import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from './config';
import { createContents } from './content';
import type { CreatePage } from './page';
import { loadCreatePages } from './page';
import { createHtml } from './markdown';
import { copyAssets, safeMkdir } from './assets';

/**
 * Parameters for `generateStaticSite`.
 */
export type SiteGenParams = {
  /**
   * Processing mode.
   * - `production` : Run the build
   * - `development` : Run the build, then launch file monitoring and web browser preview
   */
  mode: 'production' | 'development';
};

/**
 * Initialize the destination directory.
 * @param dir - Path of the destination (site distribution) directory.
 * @returns `true` if successful, `false` otherwise.
 */
const initDestDir = (dir: string): boolean => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }

  return safeMkdir(dir);
};

/**
 * Create page from content information.
 * @param params - Parameters.
 */
const createPage: CreatePage = ({ content, template, site }): void => {
  const html = createHtml(content.markdown, content.metadata, template, site);
  fs.writeFileSync(content.htmlFilePath, html);
};

/**
 * Generate a static site from a Markdown and resource files.
 * @param params - Parameters.
 */
export const generateStaticSite = async ({
  mode = 'production',
}: SiteGenParams): Promise<void> => {
  const appRootDir = process.cwd();
  const config = loadConfig(path.join(appRootDir, 'vivliostyle.sitegen.js'));

  initDestDir(config.destDir);
  copyAssets(config.srcAssetsDir, config.destDir);

  const contents = await createContents(
    config.srcPagesDir,
    config.destDir,
    config,
  );

  const { createPages } = loadCreatePages(
    path.join(appRootDir, 'vivliostyle.sitegen.func.js'),
  );

  createPages({ contents, createPage });

  if (mode === 'development') {
    // TODO: Watch mode
  }
};
