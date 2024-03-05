const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, 'data.db'); // Always save the file as 'data.db'
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit for file size
}).single('file');

// Set up a route to handle file upload
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    } else {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
      } else {
        // Delete old database file
        const oldFilePath = path.join(__dirname, 'data.db');
        fs.unlink(oldFilePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error deleting old database file:', err);
          }
        });

        // Move uploaded file to replace old database file
        const newFilePath = path.join(__dirname, 'uploads', 'data.db');
        fs.rename(req.file.path, newFilePath, (err) => {
          if (err) {
            console.error('Error moving uploaded file:', err);
            res.status(500).json({ error: 'Failed to save database file' });
          } else {
            res.json({ message: 'Database file uploaded and replaced successfully' });
          }
        });
      }
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
