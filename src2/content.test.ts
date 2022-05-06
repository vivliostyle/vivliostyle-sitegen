import { createContent, createContents } from './content';

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
