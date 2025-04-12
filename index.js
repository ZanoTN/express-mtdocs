const express = require('express');
const path = require('path');
const ejs = require('ejs');

const { setSettings, getMenu, getSectionHtml, getVersion } = require('./lib/data');

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

  router.get('*', (req, res) => {
    try {
      if (req.path === '/' || req.path === '') {
        req.url = '/index';
      }

      // Replace the %20 with a space in the URL
      req.url = req.url.replace(/%20/g, ' ');

      // Remove the back directory from the URL ("../")
      req.url = req.url.replace(/\/\.\.\//g, '');

      const templatePath = path.join(__dirname, 'views', 'layout.ejs');

      setSettings(options.baseUrl, options.title, options.baseDocsPath);
      const sectionHtml = getSectionHtml(req);
      const menuList = getMenu(req);
      const version = getVersion();

      const data = {
        sectionHtml,
        menuList,
        version,
        title: options.title
      };

      ejs.renderFile(templatePath, data, (err, html) => {
        if (err) {
          console.error('MTDocs error: Error rendering EJS template:', err);
          res.status(500).send('Internal Server Error');
        } else {
          res.send(html);
        }
      });
    } catch (error) {
      const errorTemplatePath = path.join(__dirname, 'views', 'error.ejs');

      console.error('MTDocs error:', error);
      ejs.renderFile(errorTemplatePath, {error}, (err, html) => {
        if (err) {
          console.error('MTDocs error: Error rendering EJS template:', err);
          res.status(500).send('Internal Server Error');
        } else {
          res.status(500).send(html);
        }
      });
    }
  });

  return router;
}

module.exports = {
  view
};
