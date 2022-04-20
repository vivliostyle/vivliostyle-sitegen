import { createDestFilePath, createContent, createContents } from './content';

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

it('Create content', async () => {
  const content = await createContent(
    'src2/data/pages/index.md',
    'src2/data/pages',
    'src2/data/public',
    { customKeys: ['date'] },
  );

  expect(content.markdownFilePath).toBe('src2/data/pages/index.md');
  expect(content.htmlFilePath).toBe('src2/data/public/index.html');
  expect(content.metadata.title).toBe('My Web Site');
  expect(content.metadata.custom!.date).toBe('2022-04-20');
});

it('Create multiple contents', async () => {
  const contents = await createContents('src2/data/pages', 'src2/data/public', {
    customKeys: ['date'],
  });
  expect(contents.length).toBe(2);
});
