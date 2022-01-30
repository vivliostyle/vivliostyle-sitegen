#!/usr/bin/env node

import commander from 'commander';
import { ssg } from './index';

/**
 * Parse the arguments of command line interface.
 * @param argv - Arguments of command line interface.
 * @returns Parsed options.
 */
const parseArgv = (argv: string[]) => {
  const program = new commander.Command();
  program
    .usage('vivliostyle-sitegen [options]')
    .description(
      'Generate an static site from Markdown and resources by VFM (Vivliostyle Flavored Markdown).',
    )
    .option('-b, --build', 'Run the site build.')
    .option('-d, --dev', 'Run the site build and watch/preview mode.')
    .version(require('../package.json').version, '-v, --version');

  program.on('--help', () => {
    console.log(`
  Examples:
    $ vivliostyle-sitegen --build
    $ vivliostyle-sitegen --dev
  
  See also:
    https://github.com/akabekobeko/vivliostyle-ssg`);
  });

  // Print help and exit if there are no arguments
  if (argv.length < 3) {
    program.help();
  }

  program.parse(argv);
  const opts = program.opts();

  return opts;
};

/**
 * Entry point of command-line-interface in vivliostyle-sitegen.
 */
const main = async () => {
  const opts = parseArgv(process.argv);
  if (opts.build) {
    ssg();
  } else if (opts.dev) {
    ssg(true);
  }
};

main().catch((err) => {
  console.error(err);
});
