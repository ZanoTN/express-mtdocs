# Express MTDocs - Master The Docs

MTDocs is a simple yet powerful Express middleware for serving structured Markdown-based documentation inside your Node.js projects.

Ideal for developers who want elegant, in-app documentation without the need for external tools.

## 🚀 Features
  
  - 📄 Supports .md files and nested folder structures

  - 🎨 Clean, responsive UI with sidebar navigation

  - ⚙️ Plug-and-play middleware integration

  - 🧩 Works with any Express app

## 📦 Installation

```bash
npm install express-mtdocs
```

## 🛠️ Usage

```javascript
const express = require('express');
const mtdocs = require('express-mtdocs');

const app = express();

app.use("/docs", mtdocs.view());
```

### Optional Settings

You can customize the middleware by passing an options object:

```javascript
app.use("/docs", mtdocs.view({
  baseUrl: '/docs', // URL path for the documentation, defaults to '/docs'
  title: 'ZanoTN Docs', // Title of your documentation, defaults to 'MTDocs'
  baseDocsPath: 'docs' // Path to your markdown files, defaults to 'docs'
}));
```
## 📁 Suggested Folder Structure
```markdown
example-docs/
├── index.md    <- Main entry point for your documentation
├── getting-started.md
├── advanced/
│   ├── configuration.md
│   └── troubleshooting.md
└── api/
    ├── endpoints/
    │   ├── user.md
    │   └── product.md
    └── authentication.md
```

## Screenshots

![Screenshot 1](https://raw.githubusercontent.com/ZanoTN/express-mtdocs/main/docs/screenshots/screenshot1.png)