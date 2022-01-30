# vivliostyle-sitegen

[WIP] Generate an static site from Markdown and resources by VFM (Vivliostyle Flavored Markdown).

## Install

If want to install globally, do the following.

```
$ npm i -g @vivliostyle/sitegen
```

If want to create a new project for your website, do the following.

```
$ mkdir my-site
$ cd my-site
$ npm init
$ npm i @vivliostyle/sitegen
```

## Structure of the files and directories

This section describes the files and directories structure of a project that uses vivliostyle-sitegen.

```
./
├── package.json
├── vivliostyle.sitegen.js
├── public/
└── src/
    ├── assets/
    ├── pages/
    ├── sass/
    └── templates/
```

| Files/Directories        | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `package.json`           | Project file of Node.js                                           |
| `vivliostyle.sitegen.js` | Configuration file of vivliostyle-sitegen.                        |
| `public/`                | Output directory for sites built by vivliostyle-sitegen.          |
| `src/`                   | Source directory.                                                 |
| `src/assets/`            | Location for the files and directories to be copied to `public/`. |
| `src/pages/`             | Location for the Markdown files and linked resources.             |
| `src/sass/`              | Location for the Sass/SCSS files.                                 |
| `src/templates/`         | Location for the template files by [EJS](https://ejs.co/).        |

### vivliostyle.sitegen.js

Configuration file of vivliostyle-sitegen.

```js
module.exports = {
  site: {
    title: "Sample Site",
  },
  sass: [{ src: "index.scss", dest: "style.css" }],
  link: ["public/sample.css", "public/style.css"],
  script: ["public/app.js"],
};
```

| Property | Type           | Description                                                   |
| -------- | -------------- | ------------------------------------------------------------- |
| `site`   | `Object`       | Defines the user's data to be passed to the EJS templates.    |
| `sass`   | `SassConfig[]` | Configuration of the Sass/SCSS transpile to CSS.              |
| `link`   | `String[]`     | Relative path of files to be processed as `<link>` in HTML.   |
| `script` | `String[]`     | Relative path of files to be processed as `<script>` in HTML. |

#### SassConfig

| Property | Type     | Description                      |
| -------- | -------- | -------------------------------- |
| `src`    | `String` | Path of the Sass/SCSS file.      |
| `dest`   | `String` | Path of the transpiled CSS file. |

#### EJS templates

[EJS](https://ejs.co/) templates in `templates/` allow customization of the `<body>` of the HTML converted from Markdown.

```html
<header>
  <h1><%- site.title %></h1>
  <nav>HOME</nav>
</header>
<article><%- html %></article>
```

The following data is specified in the template.

| Data       | Type       | Description                                                   |
| ---------- | ---------- | ------------------------------------------------------------- |
| `html`     | `String`   | HTML converted from Markdown that will be output in `<body>`. |
| `metadata` | `Metadata` | Data converted from Frontmatter in Markdown.                  |
| `site`     | `Object`   | Data defined in `site` of vivliostyle-sitegen.                |

See Frontmatter in the [VFM reference](<(https://vivliostyle.github.io/vfm/#/vfm)>) for the structure of `Metadata`.

If define `site.title`, it will be specially referenced by `<title>`.

```html
<title>Page Title | site.title</title>
```

## CLI

Run vivliostyle-sitegen as a command line interface.

```
Usage:  vivliostyle-sitegen [options]

Generate an static site from Markdown and resources by VFM (Vivliostyle Flavored Markdown).

Options:
  -b, --build    Run the site build.
  -d, --dev      Run the site build and watch/preview mode.
  -v, --version  output the version number
  -h, --help     display help for command

  Examples:
    $ vivliostyle-sitegen --build
    $ vivliostyle-sitegen --dev

  See also:
    https://github.com/akabekobeko/vivliostyle-ssg
```

It is easy to define the command in scripts in the package.json of the project for the website.

```json
{
  "scripts": {
    "start": "vivliostyle-sitegen --dev",
    "build": "vivliostyle-sitegen --build"
  }
}
```

Run the watch/preview mode (`Ctrl` + `C` key to exit):

```
$ npm start
```

Run the build:

```
$ npm run build
```
