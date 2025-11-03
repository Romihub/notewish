const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const { db } = require('./src/lib/firebaseAdmin');

async function getCardFromFirestore(cardId) {
  const docRef = db.collection('cards').doc(cardId);
  const doc = await docRef.get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
}

const app = express();
const port = 4000;

app.use(express.json());

app.post('/generate-video', async (req, res) => {
  const { cardId, url } = req.body;
  console.log(`Received request to generate video for cardId: ${cardId}`);

  if (!cardId || !url) {
    return res.status(400).send({ error: 'cardId and url are required' });
  }

  let browser;
  try {
    // 1. Get Card Data
    const cardData = await getCardFromFirestore(cardId);
    if (!cardData) {
      return res.status(404).send({ error: 'Card not found' });
    }
    const totalPages = 1 + (cardData.assets.messageVariations ? 1 : 0) + (cardData.assets.imageUrl ? 1 : 0) + (cardData.assets.songUrl ? 1 : 0);

    // 2. Launch Puppeteer
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // 3. Capture Screenshots
    const screenshots = [];
    for (let i = 0; i < totalPages; i++) {
      // Correctly form the URL with a query parameter
      const pageUrl = `${url.replace('localhost', '127.0.0.1')}?page=${i}`;
      console.log(`Navigating to page ${i}: ${pageUrl}`);
      
      await page.goto(pageUrl, { 
        waitUntil: 'networkidle2', // More flexible than networkidle0
        timeout: 60000 // 60 second timeout
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for animations to settle
      const screenshot = await page.screenshot();
      screenshots.push(screenshot);
      console.log(`Captured screenshot for page ${i}`);
    }

    // 4. Save Screenshots to a temporary directory
    const tempDir = `./temp_${cardId}`;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    screenshots.forEach((shot, i) => {
      fs.writeFileSync(`${tempDir}/frame_${i}.png`, shot);
    });

    // 5. Create Video from Screenshots using FFmpeg
    const videoPath = `${tempDir}/output.mp4`;
    const ffmpegCommand = `"${ffmpeg}" -framerate 1 -i ${tempDir}/frame_%d.png -c:v libx264 -r 30 -pix_fmt yuv420p ${videoPath}`;
    
    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`FFmpeg error: ${error}`);
          return reject(error);
        }
        resolve(stdout);
      });
    });

    // 6. Add Audio if it exists
    if (cardData.assets.songUrl) {
      const finalVideoPath = `${tempDir}/final.mp4`;
      const audioCommand = `"${ffmpeg}" -i ${videoPath} -i ${cardData.assets.songUrl} -c:v copy -c:a aac -shortest ${finalVideoPath}`;
      await new Promise((resolve, reject) => {
        exec(audioCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`FFmpeg audio error: ${error}`);
            return reject(error);
          }
          resolve(stdout);
        });
      });
      res.sendFile(finalVideoPath, { root: __dirname });
    } else {
      res.sendFile(videoPath, { root: __dirname });
    }

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).send({ error: 'Failed to generate video', details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
    // Clean up temp files
    const tempDir = `./temp_${cardId}`;
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

app.listen(port, () => {
  console.log(`Video generation server listening at http://localhost:${port}`);
});
