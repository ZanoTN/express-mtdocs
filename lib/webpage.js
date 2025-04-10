const { getMenuHtml, getPageHtml } = require('./components');

const view = (req, res) => {
  let pageHtml = getPageHtml(req);
  const menuHtml = getMenuHtml(req);

  if (pageHtml === null) {
    pageHtml = '<h2>Document not found</h2>';
  }

  res.send(generateHtmlPage(pageHtml, menuHtml));
};

const generateHtmlPage = (mainView, menuHtml) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RTDocs</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq" crossorigin="anonymous"></script>
      </head>
      <body>
        <div class="container-xxl">
          <div class="row">
            <div class="col-12 col-md-3 bg-body-secondary p-0 vh-md-100">
              <div class="d-flex flex-column justify-content-center align-items-center w-100 bg-primary text-white py-3 px-0 mx-0">
                <h1 class="text-center text-light">RTDocs</h1>
              </div>
              <nav class="list-group mt-3 overflow-auto flex-grow-1">
                ${menuHtml}
              </nav>
              <div>
                <p class="text-center text-muted mb-0">RTDocs v1.0.0</p>
              </div>
            </div>
            <div class="col-12 col-md-9">
              ${mainView}
            </div>
          </div>
        </div>
      </body>
      <style>
        ${customStyle}
      </style>


    </html>`;
};

const customStyle = `
@media (min-width: 768px) {
  .vh-md-100 {
    height: 100vh !important;
  }
}
nav > li a {
  text-decoration: none;
  color: blue;
}
pre code {
  background-color: #343a40; /* Bootstrap's bg-dark-ish (gray-800) */
  color: #f8f9fa;            /* Bootstrap's text-light (gray-100) */
  display: block;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  overflow-x: auto;
  line-height: 1.6;
  margin-bottom: 1rem;
}

code {
  background-color: #495057; /* Bootstrap's gray-700 */
  color: #f8f9fa;            /* Bootstrap's light text */
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
}
`;

exports.view = view;
