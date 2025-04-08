const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());

// Lưu file vào thư mục upload/
const upload = multer({ dest: 'upload/' });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imagePath = path.join(__dirname, 'upload', req.file.filename);
  console.log("📸 Image received:", imagePath);

  // đường dẫn kết nối từ nodejs đến file python 
  const python = spawn('python', ['../ai-model/recognize.py', imagePath]);

  let pythonData = '';
  let pythonError = '';

  python.stdout.on('data', (data) => {
    pythonData += data.toString();
  });

  python.stderr.on('data', (data) => {
    pythonError += data.toString();
  });

  python.on('close', (code) => {
    if (pythonError) {
      console.error("🐍 Python error:", pythonError);
      return res.status(500).json({ error: 'Python processing error', details: pythonError });
    }

    try {
      const result = JSON.parse(pythonData);
      console.log("✅ Python result:", result);
      res.json(result);
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      res.status(500).json({ error: 'Python processing error', details: pythonError });
    }
  });
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
