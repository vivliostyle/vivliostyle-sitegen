import { createContent, createContents } from './content';

it('Create content', async () => {
  const content = await createContent(
    'src/data/pages/index.md',
    'src/data/pages',
    { customKeys: ['date'] },
  );

  expect(content.path).toBe('index.html');
  expect(content.metadata.title).toBe('My Web Site');
  expect(content.metadata.custom!.date).toBe('2022-04-20');
});

it('Create content of sub directories', async () => {
  const content = await createContent(
    'src/data/pages/blog/article.md',
    'src/data/pages',
    { customKeys: ['date'] },
  );

  expect(content.path).toBe('blog/article.html');
  expect(content.metadata.title).toBe('Blog Article');
  expect(content.metadata.custom!.date).toBe('2022-05-30');
});

it('Create multiple contents', async () => {
  const contents = await createContents('src/data/pages', 'src/data/public', {
    customKeys: ['date'],
  });
  expect(contents.length).toBe(2);
});
