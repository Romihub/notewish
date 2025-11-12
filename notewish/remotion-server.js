/**
 * REMOTION RENDER SERVER
 * Professional video rendering with React → Video
 * NO SCREENSHOTS - Direct React rendering
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const { db } = require('./src/lib/firebaseAdmin');
const fs = require('fs');

const app = express();
const port = 4004; // New port for Remotion server

app.use(express.json());

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCardFromFirestore(cardId) {
  const docRef = db.collection('cards').doc(cardId);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// ============================================
// VIDEO GENERATION ENDPOINT
// ============================================

app.post('/render-video', async (req, res) => {
  const { cardId, compositionId = 'CardVideo' } = req.body;
  console.log(`\n========================================`);
  console.log(`[REMOTION-SERVER] 🎬 Starting Remotion render`);
  console.log(`[REMOTION-SERVER] Composition: ${compositionId}`);
  console.log(`[REMOTION-SERVER] Card ID: ${cardId || 'N/A (test mode)'}`);
  console.log(`========================================\n`);

  const tempDir = path.resolve(__dirname, `temp_remotion_${Date.now()}`);
  const outputPath = path.join(tempDir, 'final.mp4');

  try {
    // ============================================
    // STEP 1: LOAD CARD DATA (only for CardVideo)
    // ============================================
    let cardData = null;
    
    if (compositionId === 'TestVideo') {
      console.log('[REMOTION-SERVER] 📋 Step 1/5: Test mode - no card data needed');
    } else {
      if (!cardId) {
        return res.status(400).send({ error: 'cardId required for CardVideo' });
      }
      console.log('[REMOTION-SERVER] 📋 Step 1/5: Loading card data...');
      cardData = await getCardFromFirestore(cardId);
      if (!cardData) {
        console.error(`[REMOTION-SERVER] ❌ Card not found: ${cardId}`);
        return res.status(404).send({ error: 'Card not found' });
      }
      console.log(`[REMOTION-SERVER] ✅ Card loaded successfully`);
      console.log(`[REMOTION-SERVER]    - Template: ${cardData.templateId}`);
      console.log(`[REMOTION-SERVER]    - Pages: ${cardData.pages?.length || 0}`);
    }

    // Create temp directory
    console.log(`[REMOTION-SERVER] 📁 Creating temp directory: ${tempDir}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // ============================================
    // STEP 2: BUNDLE REMOTION PROJECT
    // ============================================
    console.log('\n[REMOTION-SERVER] 📦 Step 2/5: Bundling Remotion project...');
    const entryPoint = path.join(__dirname, 'src/remotion/index.ts');
    console.log(`[REMOTION-SERVER]    - Entry point: ${entryPoint}`);
    console.log(`[REMOTION-SERVER]    - Entry exists: ${fs.existsSync(entryPoint)}`);
    
    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });
    
    console.log('[REMOTION-SERVER] ✅ Bundle created successfully');
    console.log(`[REMOTION-SERVER]    - Bundle location: ${bundleLocation}`);

    // ============================================
    // STEP 3: SELECT COMPOSITION
    // ============================================
    console.log('\n[REMOTION-SERVER] 🎯 Step 3/5: Selecting composition...');
    console.log(`[REMOTION-SERVER]    - Composition ID: ${compositionId}`);
    console.log(`[REMOTION-SERVER]    - Serve URL: ${bundleLocation}`);
    
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        cardId,
        cardData,
      },
    });
    
    console.log('[REMOTION-SERVER] ✅ Composition selected successfully');
    console.log(`[REMOTION-SERVER]    - Resolution: ${composition.width}x${composition.height}`);
    console.log(`[REMOTION-SERVER]    - Duration: ${composition.durationInFrames} frames`);
    console.log(`[REMOTION-SERVER]    - FPS: ${composition.fps}`);

    // ============================================
    // STEP 4: RENDER VIDEO
    // ============================================
    console.log('\n[REMOTION-SERVER] 🎬 Step 4/5: Rendering video...');
    console.log(`[REMOTION-SERVER]    - Output: ${outputPath}`);
    console.log(`[REMOTION-SERVER]    - Codec: h264`);
    console.log('[REMOTION-SERVER]    - Starting render (this may take a few minutes)...\n');
    
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        cardId,
        cardData,
      },
      onProgress: ({ progress }) => {
        const percent = Math.round(progress * 100);
        if (percent % 10 === 0) {
          console.log(`[REMOTION-SERVER]    📊 Progress: ${percent}%`);
        }
      },
    });

    console.log('\n[REMOTION-SERVER] ✅ Video rendered successfully!');
    console.log(`[REMOTION-SERVER]    - File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

    // ============================================
    // STEP 5: SEND VIDEO
    // ============================================
    console.log('\n[REMOTION-SERVER] 📤 Step 5/5: Sending video...');
    res.sendFile(outputPath);

  } catch (error) {
    console.error('\n========================================');
    console.error('[REMOTION-SERVER] ❌ RENDER FAILED');
    console.error('========================================');
    console.error('[REMOTION-SERVER] Error:', error.message);
    console.error('[REMOTION-SERVER] Stack:', error.stack);
    console.error('========================================\n');
    
    res.status(500).send({ 
      error: 'Failed to render video', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Cleanup temp directory after 5 seconds
    if (fs.existsSync(tempDir)) {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log('[REMOTION-SERVER] 🧹 Cleaned up temp directory');
        } catch (e) {
          console.error('[REMOTION-SERVER] Failed to clean up:', e);
        }
      }, 5000);
    }
  }
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'remotion-video-server',
    version: '1.0.0',
    architecture: 'react-to-video',
    features: [
      'No screenshots',
      'CSS animations preserved',
      'Professional quality',
      'Canva-level output'
    ]
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(port, () => {
  console.log(`[REMOTION-SERVER] 🚀 Remotion Video Server running on http://localhost:${port}`);
  console.log(`[REMOTION-SERVER] 🎨 Architecture: React → Direct Video Render`);
  console.log(`[REMOTION-SERVER] ✨ NO SCREENSHOTS - Professional quality guaranteed`);
});
