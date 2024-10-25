require('dotenv').config();
const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Creates a client
const client = new vision.ImageAnnotatorClient();

// Middleware to check API key
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).send('Forbidden: Invalid API key.');
  }
  next();
};

app.post('/analyze', checkApiKey, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const [result] = await client.textDetection(req.file.path);
    const labels = result.textAnnotations;

    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('Failed to delete file:', err);
      }
    });

    res.send(labels);
  } catch (error) {
    res.status(500).send('Error processing image.');
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
