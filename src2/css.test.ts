import { transpileCss } from './css';

it('Transpile SCSS', () => {
  const css = transpileCss('sass', './src2/data/scss/app.scss');
  const expected = `body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #fbfcfa;
}`;
  expect(css).toBe(expected);
});
