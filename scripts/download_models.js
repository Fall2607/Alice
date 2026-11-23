const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

let completed = 0;

files.forEach(file => {
  const url = baseUrl + file;
  const dest = path.join(modelsDir, file);
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download ${file}, status: ${res.statusCode}`);
      return;
    }
    const fileStream = fs.createWriteStream(dest);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file}`);
      completed++;
      if (completed === files.length) console.log("All models downloaded successfully.");
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${file}:`, err.message);
  });
});
