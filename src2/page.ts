import path from 'node:path';
import { Content } from './content';

/**
 * Parameters for `CreatePage`.
 */
export type CreatePageParams = {
  /**
   * Content.
   */
  content: Content;
  /**
   * Template string of EJS.
   */
  template: string;
  /**
   * User data of the web site.
   */
  site: object;
};

/**
 * Create page from content information.
 * @param params - Parameters.
 */
export type CreatePage = (params: CreatePageParams) => void;

/**
 * Parameters for `CreatePages` function.
 */
export type CreatePagesParams = {
  /**
   * Contents.
   */
  contents: Content[];
  /**
   * Function to create pages.
   * Pages are output as HTML files by specifying data processed by a function implementing `CreatePages`.
   */
  createPage: CreatePage;
};

/**
 * Create pages from content information.
 * @param params - Parameters.
 * @returns Collection of changed content. This will be reflected in the next processing.
 */
export type CreatePages = (params: CreatePagesParams) => Content[];

/**
 * Result values of `loadCreatePages`.
 */
export type LoadCreatePagesResult = {
  /**
   * Function that implements `CreatePages`.
   */
  createPages: CreatePages;
  /**
   * `true` if a user-defined function was loaded, `false` if it failed to load and is the default function.
   */
  isUserFunction: boolean;
};

/**
 * Create pages from content information.
 *
 * This function is used if the user does not implement `createPages` based on `CreatePages`.
 * @param params - Parameters.
 * @returns Collection of changed content. This will be reflected in the next processing.
 */
const defaultCreatePages: CreatePages = (
  params: CreatePagesParams,
): Content[] => {
  const { contents, createPage } = params;
  contents.forEach((content) => {
    createPage({ content, template: '', site: {} });
  });

  return contents;
};

/**
 * Loads the `exports.createPages` function, which is the user's implementation of `CreatePages`.
 * @param userScriptFilePath - Path to the JavaScript file where the user defined `exports.createPages`.
 * @returns User implemented `CreatePages` function `exports.createPages`. If not found, default function in `vivliostyle-sitegen`.
 */
export const loadCreatePages = (
  userScriptFilePath: string = '',
): LoadCreatePagesResult => {
  try {
    const userExports = require(path.resolve(userScriptFilePath));
    if (
      userExports &&
      userExports.createPages &&
      typeof userExports.createPages === 'function'
    ) {
      return {
        createPages: userExports.createPages as CreatePages,
        isUserFunction: true,
      };
    }
  } catch {
    // Load failure returns the default function, so nothing is done.
  }

  return {
    createPages: defaultCreatePages,
    isUserFunction: false,
  };
};
