const fs = require('fs');
const { url } = require('inspector');
const markdownIt = require('markdown-it');

const FILE_EXTENSION = '.md';
const BASE_FILE_PATH = './docs/';
const BASE_URL_PATH = '/rtdocs';
const IS_WINDOWS = process.platform === 'win32';

/** Get the file path from the request URL */
const getFilePathFromUrl = (req) => {
  let url = req.url;

  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    url = url.substring(0, queryIndex);
  }
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    url = url.substring(0, hashIndex);
  }

  if (url.startsWith('/')) {
    url = url.substring(1);
  }

  return BASE_FILE_PATH + url + FILE_EXTENSION;
};

/** Get the file content from path, if not found return null */
const getFileContent = (path) => {
  if (!fs.existsSync(path)) {
    return null;
  }

  const content = fs.readFileSync(path, 'utf8');
  if (content.length === 0) {
    return null;
  }

  return content;
};

const convertMarkdownToHtml = (markdownContent) => {
  const md = new markdownIt();
  return md.render(markdownContent);
};

/** Get list of all files in the directory "docs" */
const getListAllFiles = () => {
  // example:
  // docs/
  // ├── example.md
  // └── index.md <- this is the main page
  // └── section/
  //     ├── example.md
  //     └── example2.md

  return readDirRecursive(BASE_FILE_PATH);
};

/** Get list of all files in the directory "docs" */
const readDirRecursive = (dir) => {
  const files = fs.readdirSync(dir);

  const directories = [];
  const filesList = [];
  const listToReturn = [];

  for (const file of files) {
    const filePath = IS_WINDOWS ? dir + '\\' + file : dir + '/' + file;
    if (fs.statSync(filePath).isDirectory()) {
      directories.push(filePath);
    } else {
      filesList.push(filePath);
    }
  }

  // Recursively read directories
  for (const directory of directories) {
    const listSubDir = readDirRecursive(directory);

    listToReturn.push({
      name: directory.substring(directory.lastIndexOf('/') + 1),
      url: BASE_URL_PATH + directory.replace(BASE_FILE_PATH, '').replace(FILE_EXTENSION, ''),
      children: listSubDir,
    });
  }

  for (const file of filesList) {
    if (!file.endsWith(FILE_EXTENSION)) {
      continue;
    }

    const fileName = file.substring(file.lastIndexOf('/') + 1).replace(FILE_EXTENSION, '');

    listToReturn.push({
      name: fileName,
      url: BASE_URL_PATH + file.replace(BASE_FILE_PATH, '').replace(FILE_EXTENSION, ''),
    });
  }

  // Sort the list: directories alphabetically first, then files alphabetically
  listToReturn.sort((a, b) => {
    const idADirectory = a.children !== undefined;
    const idBDirectory = b.children !== undefined;

    if (idADirectory && idBDirectory) {
      return a.name.localeCompare(b.name);
    } else if (idADirectory && !idBDirectory) {
      return -1;
    } else if (!idADirectory && idBDirectory) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return listToReturn;
};

const convertMenuToHtml = (menu) => {
  let html = '<ul>';

  for (const item of menu) {
    const url = item.url === undefined ? '' : item.url;
    html += `<li><a href="${url}">${item.name}</a>`;

    if (item.children !== undefined) {
      html += convertMenuToHtml(item.children);
    }

    html += '</li>';
  }

  html += '</ul>';
  return html;
};

/** Get the HTML page from the request */
const getPageHtml = (req) => {
  const filePath = getFilePathFromUrl(req);
  const fileContent = getFileContent(filePath);

  if (fileContent === null) {
    return null;
  }

  return convertMarkdownToHtml(fileContent);
};

/** Get the side menu with all section */
const getMenuHtml = (req) => {
  const listFile = getListAllFiles();

  return convertMenuToHtml(listFile);
};

exports.getPageHtml = getPageHtml;
exports.getMenuHtml = getMenuHtml;
