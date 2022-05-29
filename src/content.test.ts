import { createContent, createContents } from './content';

it('Create content', async () => {
  const content = await createContent(
    'src/data/pages/index.md',
    'src/data/pages',
    'src/data/public',
    { customKeys: ['date'] },
  );

  expect(content.markdownFilePath).toBe('src/data/pages/index.md');
  expect(content.htmlFilePath).toBe('src/data/public/index.html');
  expect(content.metadata.title).toBe('My Web Site');
  expect(content.metadata.custom!.date).toBe('2022-04-20');
});

it('Create multiple contents', async () => {
  const contents = await createContents('src/data/pages', 'src/data/public', {
    customKeys: ['date'],
  });
  expect(contents.length).toBe(2);
});
