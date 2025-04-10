const express = require('express');
const moduleDocs = require('./index.js');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const PORT = 4400;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Add the route for serving the documentation
app.use('/rtdocs', moduleDocs.view);
