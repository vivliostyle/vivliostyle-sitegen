import { loadCreatePages } from './page';

it('Load default function of createPages', () => {
  const { isUserFunction } = loadCreatePages();
  expect(isUserFunction).toBeFalsy();
});

it('Load user function of createPages', () => {
  const { isUserFunction } = loadCreatePages(
    'src/data/vivliostyle.sitegen.func.js',
  );
  expect(isUserFunction).toBeTruthy();
});

it('createPages', () => {
  let markdown = 'Sample';
  const { createPages } = loadCreatePages();

  createPages({
    contents: [
      {
        markdown: 'Text',
        path: '',
        metadata: {},
      },
    ],
    createPage: ({ content }) => {
      // Checks that data was properly passed to the callback
      markdown = content.markdown;
    },
  });

  expect(markdown).toBe('Text');
});
