const express = require('express');
const path = require('path');
const ejs = require('ejs');

const { getMenu, getSectionHtml } = require('./lib/data');


const router = express.Router();

// Serve static files from package's public directory
router.use('/_rtdocs_assets', express.static(path.join(__dirname, 'public')));

// Render EJS template from inside the module
router.get('*', (req, res) => {
  const templatePath = path.join(__dirname, 'views', 'layout.ejs');

  const sectionHtml = getSectionHtml(req);
  const menuList = getMenu(req);

  const data = {
    sectionHtml,
    menuList,
    baseUrl: '/rtdocs',
    title: 'RTDocs'
  };

  ejs.renderFile(templatePath, data, (err, html) => {
    if (err) {
      console.error('Error rendering EJS template:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(html);
    }
  });
});

module.exports = {
  view: router
};