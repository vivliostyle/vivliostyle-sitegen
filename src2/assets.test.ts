import { createDestFilePath } from './assets';

it('Create destination file path', () => {
  const filePath = createDestFilePath(
    '/src/pages/blog/sample.jpg',
    '/src/pages',
    '/public',
  );
  const expected = '/public/blog/sample.jpg';

  expect(filePath).toBe(expected);
});

it('Create destination file path with extension name', () => {
  const filePath = createDestFilePath(
    '/src/pages/blog/sample.md',
    '/src/pages',
    '/public',
    '.html',
  );
  const expected = '/public/blog/sample.html';

  expect(filePath).toBe(expected);
});
