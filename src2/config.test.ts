import path from 'node:path';
import type { Config } from './config';
import { loadConfig } from './config';

it('Loads user-defined configurations', () => {
  const appRootDir = path.resolve('./src2/data/');
  const config = loadConfig(path.join(appRootDir, 'vivliostyle.sitegen.js'));
  const expected: Config = {
    srcPagesDir: path.join(appRootDir, 'pages'),
    srcAssetsDir: path.join(appRootDir, 'assets'),
    destDir: path.join(appRootDir, 'public'),
    site: {
      title: 'Sample Site',
    },
    styleSheets: ['style.css', 'lib/sample.css'],
    scripts: [
      'app.js',
      'lib/sample.js',
      'https://cdnjs.cloudflare.com/ajax/libs/mermaid/9.0.1/mermaid.min.js',
    ],
    customKeys: ['date', 'categories', 'tags'],
  };

  expect(config).toStrictEqual(expected);
});

it('Failed to load user-defined configurations (default values)', () => {
  const config = loadConfig('');
  const appRootDir = process.cwd();
  const expected = {
    srcPagesDir: path.join(appRootDir, 'src', 'pages'),
    srcAssetsDir: path.join(appRootDir, 'src', 'assets'),
    destDir: path.join(appRootDir, 'public'),
    site: {},
    styleSheets: [],
    scripts: [],
    customKeys: [],
  };

  expect(config).toStrictEqual(expected);
});
