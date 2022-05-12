import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from './config';
import { createContents } from './content';
import type { CreatePage } from './page';
import { loadCreatePages } from './page';
import { createHtml } from './markdown';

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
 * Create page from content information.
 * @param params - Parameters.
 */
const createPage: CreatePage = ({ content, template, site }) => {
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
