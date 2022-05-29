exports.createPages = ({ contents, createPage }) => {
  contents.forEach((content) => {
    createPage({ content, template: '', site: {} });
  });

  return contents;
};
