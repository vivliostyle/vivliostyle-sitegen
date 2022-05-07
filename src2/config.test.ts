import { loadConfig } from './config';

it('Loads user-defined configurations', () => {
  const config = loadConfig('./src2/data');
  const expected = {
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

  expect(config.userConfig).toStrictEqual(expected);
});

it('Failed to load user-defined configurations (default values)', () => {
  const config = loadConfig('');
  const expected = {
    site: {},
    styleSheets: [],
    scripts: [],
    customKeys: [],
  };

  expect(config.userConfig).toStrictEqual(expected);
});
