import { createDestFilePath } from './util';

describe('createDestFilePath', () => {
  it('With extname', () => {
    const received = createDestFilePath(
      'src/pages/index.md',
      'src/pages/',
      'public/',
      '.html',
    );
    const expected = 'public/index.html';
    expect(received).toBe(expected);
  });
});
