const fs = require('fs');
const { url } = require('inspector');
const markdownIt = require('markdown-it');

let FILE_EXTENSION = '.md';
let BASE_FILE_PATH = './docs/';
let BASE_URL_PATH = '/mtdocs';
let IS_WINDOWS = process.platform === 'win32';

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
    const filePath = IS_WINDOWS ? dir + '\\' + file : dir + '/' + file;
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
      name: humanizeFileName(fileName),
      url: BASE_URL_PATH + file.replace(BASE_FILE_PATH, '').replace(FILE_EXTENSION, ''),
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
  const filePath = getFilePathFromUrl(req);
  const fileContent = getFileContent(filePath);

  if (fileContent === null) {
    return null;
  }

  return convertMarkdownToHtml(fileContent);
};

/** Get the side menu with all section */
const getMenu = (req) => {
  const selectedFilePath = getFilePathFromUrl(req);

  return getListAllFiles(selectedFilePath) || [];
};

/** Get the version of the app from package.json */
const getVersion = () => {
  const packageJson = fs.readFileSync('./package.json', 'utf8');
  const json = JSON.parse(packageJson);
  return json.version;
}

/** Set the settings for the app */
const setSettings = (baseUrl, title, baseDocsPath) => {
  if (baseUrl !== undefined && baseUrl !== null) {
    BASE_URL_PATH = baseUrl;
  }

  if (baseDocsPath !== undefined && baseDocsPath !== null) {
    BASE_FILE_PATH = "./"+baseDocsPath+"/";
  }
};

exports.getSectionHtml = getSectionHtml;
exports.getMenu = getMenu;
exports.getVersion = getVersion;
exports.setSettings = setSettings;
