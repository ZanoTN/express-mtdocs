const express = require('express');
const path = require('path');
const ejs = require('ejs');

const { getMenu, getSectionHtml, getVersion } = require('./lib/data');


const router = express.Router();

// Render EJS template from inside the module
router.get('*', (req, res) => {
  const templatePath = path.join(__dirname, 'views', 'layout.ejs');

  const sectionHtml = getSectionHtml(req);
  const menuList = getMenu();
  const version = getVersion();

  const data = {
    sectionHtml,
    menuList,
    version,
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