import { createMetadata, createHtml } from './markdown';

it('<link> for CSS', () => {
  const metadata = createMetadata('', '/blog/2022/04/', {
    styleSheets: ['/style.css'],
  });
  const expected = {
    link: [
      [
        { name: 'rel', value: 'stylesheet' },
        { name: 'href', value: '../../../style.css' },
      ],
    ],
  };
  expect(metadata).toStrictEqual(expected);
});

it('<script> for JavaScript', () => {
  const metadata = createMetadata('', '/blog/2022/03/', {
    scripts: ['/app.js'],
  });
  const expected = {
    script: [
      [
        { name: 'type', value: 'text/javascript' },
        { name: 'src', value: '../../../app.js' },
      ],
    ],
  };

  expect(metadata).toStrictEqual(expected);
});

it('Markdown to HTML', () => {
  const md = `---
title: "Sample Page"
---

Text
`;
  const metadata = createMetadata(md, '/');
  const html = createHtml(md, metadata);
  const expected = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Sample Page</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <p>Text</p>
  </body>
</html>
`;

  expect(html).toBe(expected);
});

it('Markdown to HTML with template', () => {
  const md = `---
title: "Sample Page"
date: "2022-04-18"
---
  
Text
`;
  const metadata = createMetadata(md, '/', { customKeys: ['date'] });
  const template = `<article>
<header><h1><%- site.title %></h1></header>
<div><span class="date"><%- metadata.custom.date %></span></div>
<%- html %>
</article>`;
  const site = { title: 'Sample Web Site' };
  const html = createHtml(md, metadata, template, site);
  const expected = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Sample Page</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <article>
<header><h1>Sample Web Site</h1></header>
<div><span class="date">2022-04-18</span></div>

<p>Text</p>

</article>
  </body>
</html>
`;

  expect(html).toBe(expected);
});
