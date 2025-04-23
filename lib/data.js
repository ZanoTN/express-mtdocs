const fs = require('fs');
const Path = require('path');
const markdownIt = require('markdown-it');

let FILE_EXTENSION = '.md';
let BASE_FILE_PATH = './docs/';
let BASE_URL = '/docs';
let IS_WINDOWS = process.platform === 'win32';

/** Get the file path from the request URL */
const getFilePathFromReq = (req) => {
  const filePath = req.query.p || "index";
  const path = Path.join(BASE_FILE_PATH, filePath + FILE_EXTENSION);

  if (IS_WINDOWS) {
    return path.replace(/\//g, '\\');
  }
  return path.replace(/\\/g, '/');
};

/** Get the URL from the file path */
const getUrlFromFilePath = (filePath) => {
  if (filePath === undefined || filePath === null) {
    return null;
  }

  // Remove the base path from the file path and the extension
  filePath = filePath.replace(BASE_FILE_PATH.replace("/", "").replace(".", ""), '');
  filePath = filePath.replace(FILE_EXTENSION, '');

  // Clean the file path from the ".." and "." and the leading "/"
  filePath = filePath.replace(/\/\.\.\//g, '');
  filePath = filePath.replace(/^\.\//, '');
  filePath = filePath.replace(/^\//, '');

  const url = BASE_URL + "?p=" + filePath;

  return url;
}

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
const getListAllFiles = (selectedFilePath) => {
  // example:
  // docs/
  // ├── example.md
  // └── index.md <- this is the main page
  // └── section/
  //     ├── example.md
  //     └── example2.md

  return readDirRecursive(BASE_FILE_PATH, selectedFilePath);
};

/** Get list of all files in the directory "docs" */
const readDirRecursive = (dir, selectedFilePath) => {
  const files = fs.readdirSync(dir);

  const directories = [];
  const filesList = [];
  const listToReturn = [];

  for (const file of files) {
    let filePath = Path.join(dir, file);
    if (IS_WINDOWS) {
      filePath = filePath.replace(/\\/g, '/');
    }

    if (fs.statSync(filePath).isDirectory()) {
      directories.push(filePath);
    } else {
      filesList.push(filePath);
    }
  }

  // Recursively read directories
  for (const directory of directories) {
    const listSubDir = readDirRecursive(directory, selectedFilePath);
  
    listToReturn.push({
      name: humanizeFileName(directory.substring(directory.lastIndexOf('/') + 1)),
      url: getUrlFromFilePath(Path.join(selectedFilePath, directory)),
      children: listSubDir,
    });
  }

  for (const file of filesList) {
    if (!file.endsWith(FILE_EXTENSION)) {
      continue;
    }

    const fileName = file.substring(file.lastIndexOf('/') + 1).replace(FILE_EXTENSION, '');

    listToReturn.push({
      name: humanizeFileName(fileName),
      url: getUrlFromFilePath(file),
      selected: isThisFileSelected(file, selectedFilePath),
    });
  }

  // Sort the list: files alphabetically first, then directories alphabetically
  listToReturn.sort((a, b) => {
    const idADirectory = a.children !== undefined;
    const idBDirectory = b.children !== undefined;

    if (!idADirectory && !idBDirectory) {
      return a.name.localeCompare(b.name);
    } else if (idADirectory && !idBDirectory) {
      return 1;
    } else if (!idADirectory && idBDirectory) {
      return -1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return listToReturn;
};

const isThisFileSelected = (filePath, selectedFilePath) => {
  if (filePath === undefined || filePath === null) {
    return false;
  }

  if (selectedFilePath === undefined || selectedFilePath === null) {
    return false;
  }

  if (filePath.replace("//", "/") === selectedFilePath) {
    return true;
  }

  return false;
}

/** Humanize the file name */
const humanizeFileName = (fileName) => {
  if (fileName === undefined || fileName === null) {
    return '';
  }

  fileName = fileName
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\.(md|html)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  fileName = fileName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return fileName;
};

/** Get the HTML page from the request */
const getSectionHtml = (req) => {
  const filePath = getFilePathFromReq(req);
  const fileContent = getFileContent(filePath);

  if (fileContent === null) {
    return null;
  }

  return convertMarkdownToHtml(fileContent);
};

/** Get the side menu with all section */
const getMenu = (req) => {
  const selectedFilePath = getFilePathFromReq(req);

  return getListAllFiles(selectedFilePath) || [];
};

/** Get the version of the app from package.json */
const getVersion = () => {
  // Check the file node_modules/express-mtdocs/package.json exists
  if (fs.existsSync('./node_modules/express-mtdocs/package.json')) {
    const packageJson = fs.readFileSync('./node_modules/express-mtdocs/package.json', 'utf8');
    const json = JSON.parse(packageJson);
    return json.version;
  }

  // If not, check the file package.json exists (development mode)
  const packageJson = fs.readFileSync('./package.json', 'utf8');
  const json = JSON.parse(packageJson);
  return json.version;
}

/** Set the settings for the app */
const setSettings = (baseUrl, title, baseDocsPath) => {
  if (baseUrl !== undefined && baseUrl !== null) {
    BASE_URL = baseUrl;
  }

  if (baseDocsPath !== undefined && baseDocsPath !== null) {
    BASE_FILE_PATH = "./"+baseDocsPath+"/";
  }
};

const cleanRequest = (req) => {
  if (req.path === '/' || req.path === '') {
    req.url = '/index';
  }

  // Replace the %20 with a space in the URL
  req.url = req.url.replace(/%20/g, ' ');

  // Remove the back directory from the URL ("../")
  req.url = req.url.replace(/\/\.\.\//g, '');

  // Remove the trailing slash from the URL
  req.url = req.url.replace(/\/$/, '');
  
}

exports.cleanRequest = cleanRequest;
exports.getSectionHtml = getSectionHtml;
exports.getMenu = getMenu;
exports.getVersion = getVersion;
exports.setSettings = setSettings;
