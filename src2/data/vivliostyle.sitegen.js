module.exports = {
  srcPagesDir: 'pages',
  srcAssetsDir: 'assets',
  destDir: 'public',
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
