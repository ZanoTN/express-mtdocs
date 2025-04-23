const express = require('express');
const path = require('path');
const ejs = require('ejs');

const { setSettings, getMenu, getSectionHtml, getVersion, cleanRequest } = require('./lib/data');

/**
 * MTDocs: A documentation viewer for Express.js
 * @param {Object} options
 * @param {string} options.baseUrl - The base URL for the documentation. (default: '/docs')
 * @param {string} options.title - The title of the documentation. (default: 'MTDocs')
 * @param {string} options.baseDocsPath - The base path for the documentation files. (default: 'docs')
 * @returns 
 */
function view(options = {
  baseUrl: '/docs',
  title: 'MTDocs',
  baseDocsPath: 'docs'
}) {
  const router = express.Router();

  router.get('*', catchAsyncError(async (req, res) => {
    setSettings(options.baseUrl, options.title, options.baseDocsPath);

    cleanRequest(req);

    const sectionHtml = getSectionHtml(req);
    const menuList = getMenu(req);
    const version = getVersion();

    const data = {
      sectionHtml,
      menuList,
      version,
      title: options.title
    };
    const templatePath = path.join(__dirname, 'views', 'layout.ejs');

    ejs.renderFile(templatePath, data, (err, html) => {
      if (err) {
        throw err;
      } else {
        res.send(html);
      }
    });
  }));
  
  return router;
};

const catchAsyncError = (fun) => (req, res) => {
  fun(req, res).catch((err) => {
    console.error('MTDocs error:', err);

    const errorTemplatePath = path.join(__dirname, 'views', 'error.ejs');
    ejs.renderFile(errorTemplatePath, {error: err}, (err, html) => {
      if (err) {
        console.error('MTDocs error: Error rendering EJS template:', err);
        res.status(500).send('MTDocs: Internal Server Error');
      }
      else {
        res.status(500).send(html);
      }
    });
  });
}

module.exports = {
  view
};
