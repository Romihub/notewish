"use client";

import { useState } from "react";
import { uploadMusicToStorage, saveCardToFirestore, getCardFromFirestore } from "@/lib/storage";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

export default function TestFirebasePage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingStorage, setIsTestingStorage] = useState(false);
  const [isTestingFirestore, setIsTestingFirestore] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Create a dummy audio blob (1 second of silence)
  const createDummyAudioBlob = (): Blob => {
    // Create a simple WAV file (1 second of silence)
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const duration = 1; // 1 second
    const numSamples = sampleRate * duration;
    
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
    view.setUint16(32, numChannels * bitsPerSample / 8, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Audio data (silence = all zeros)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const testStorageUploadDownload = async () => {
    setIsTestingStorage(true);
    addResult("🧪 Starting Firebase Storage test...");
    
    try {
      // Step 1: Create dummy audio
      addResult("📦 Creating dummy audio file (1 second of silence)...");
      console.log("Creating dummy audio blob...");
      const dummyBlob = createDummyAudioBlob();
      console.log("Dummy blob created:", dummyBlob);
      
      // Convert to data URL
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(dummyBlob);
      });
      
      addResult(`✅ Dummy audio created (${(dummyBlob.size / 1024).toFixed(2)} KB)`);
      console.log("Data URL length:", dataUrl.length);
      
      // Step 2: Upload to Firebase Storage
      addResult("☁️ Uploading to Firebase Storage...");
      const testCardId = `test_${Date.now()}`;
      console.log("Test card ID:", testCardId);
      console.log("Starting upload with timeout...");
      
      // Add timeout to prevent hanging forever
      const uploadPromise = uploadMusicToStorage(testCardId, dataUrl);
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error("Upload timeout after 30 seconds")), 30000)
      );
      
      const uploadedUrl = await Promise.race([uploadPromise, timeoutPromise]);
      console.log("Upload completed! URL:", uploadedUrl);
      
      addResult(`✅ Upload successful!`);
      addResult(`📍 Storage URL: ${uploadedUrl.substring(0, 50)}...`);
      
      // Step 3: Test download
      addResult("⬇️ Testing download from Storage...");
      const response = await fetch(uploadedUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const downloadedBlob = await response.blob();
      addResult(`✅ Download successful! (${(downloadedBlob.size / 1024).toFixed(2)} KB)`);
      
      // Step 4: Verify it's playable
      const audioUrl = URL.createObjectURL(downloadedBlob);
      const audio = new Audio(audioUrl);
      
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
        audio.load();
      });
      
      addResult("✅ Audio is playable!");
      
      toast.success("Firebase Storage test PASSED! ✅");
      addResult("🎉 Firebase Storage test COMPLETE!");
      
    } catch (error: any) {
      addResult(`❌ Storage test FAILED: ${error.message}`);
      console.error("Full error details:", error);
      console.error("Error stack:", error.stack);
      console.error("Error name:", error.name);
      console.error("Error code:", error.code);
      toast.error(`Storage test failed: ${error.message}`);
    } finally {
      setIsTestingStorage(false);
    }
  };

  const testFirestoreReadWrite = async () => {
    setIsTestingFirestore(true);
    addResult("🧪 Starting Firestore test...");
    
    try {
      // Step 1: Create test data
      addResult("📝 Creating test card data...");
      const testCardId = `test_${Date.now()}`;
      console.log("Firestore test card ID:", testCardId);
      const testCardData = {
        id: testCardId,
        title: "Test Card",
        occasion: "Test",
        recipientName: "Test User",
        personalMessage: "This is a test message",
        templateId: "test-template",
        assets: {
          musicUrl: "https://example.com/test.mp3",
          imageUrl: "https://example.com/test.jpg",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Step 2: Write to Firestore
      addResult("☁️ Writing to Firestore...");
      console.log("Writing to Firestore:", testCardData);
      
      // Add timeout
      const writePromise = saveCardToFirestore(testCardData);
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore write timeout after 15 seconds")), 15000)
      );
      
      await Promise.race([writePromise, timeoutPromise]);
      console.log("Firestore write successful!");
      addResult(`✅ Write successful! Card ID: ${testCardId}`);
      
      // Step 3: Read from Firestore
      addResult("📖 Reading from Firestore...");
      console.log("Reading from Firestore...");
      const retrievedCard = await getCardFromFirestore(testCardId);
      console.log("Retrieved card:", retrievedCard);
      
      if (!retrievedCard) {
        throw new Error("Card not found after writing!");
      }
      
      addResult("✅ Read successful!");
      addResult(`📄 Retrieved title: "${retrievedCard.title}"`);
      addResult(`📄 Retrieved occasion: "${retrievedCard.occasion}"`);
      
      // Step 4: Verify data integrity
      if (retrievedCard.title === testCardData.title && 
          retrievedCard.occasion === testCardData.occasion) {
        addResult("✅ Data integrity verified!");
        toast.success("Firestore test PASSED! ✅");
        addResult("🎉 Firestore test COMPLETE!");
      } else {
        throw new Error("Data mismatch!");
      }
      
    } catch (error: any) {
      addResult(`❌ Firestore test FAILED: ${error.message}`);
      console.error("Full Firestore error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error code:", error.code);
      toast.error(`Firestore test failed: ${error.message}`);
    } finally {
      setIsTestingFirestore(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testStorageUploadDownload();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    await testFirestoreReadWrite();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Firebase Test Suite
          </h1>
          <p className="text-gray-600 mb-8">
            Test Firebase Storage and Firestore without wasting API credits
          </p>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testStorageUploadDownload}
              disabled={isTestingStorage}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isTestingStorage ? "Testing Storage..." : "Test Storage"}
            </button>
            
            <button
              onClick={testFirestoreReadWrite}
              disabled={isTestingFirestore}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isTestingFirestore ? "Testing Firestore..." : "Test Firestore"}
            </button>
            
            <button
              onClick={runAllTests}
              disabled={isTestingStorage || isTestingFirestore}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Run All Tests
            </button>
          </div>

          {/* Results Console */}
          <div className="bg-gray-900 rounded-lg p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-400">
                Test Console
              </h2>
              <button
                onClick={() => setTestResults([])}
                className="px-3 py-1 text-xs text-gray-400 hover:text-white border border-gray-700 rounded"
              >
                Clear
              </button>
            </div>
            
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">
                Click a test button to start...
              </p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`
                      ${result.includes('✅') ? 'text-green-400' : ''}
                      ${result.includes('❌') ? 'text-red-400' : ''}
                      ${result.includes('🧪') || result.includes('🎉') ? 'text-yellow-400 font-bold' : ''}
                      ${!result.includes('✅') && !result.includes('❌') && !result.includes('🧪') && !result.includes('🎉') ? 'text-gray-300' : ''}
                    `}
                  >
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📋 What This Tests
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span><strong>Storage Test:</strong> Creates a dummy 1-second audio file, uploads to Firebase Storage, downloads it, and verifies it's playable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span><strong>Firestore Test:</strong> Creates test card data, writes to Firestore, reads it back, and verifies data integrity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span><strong>No API Costs:</strong> Uses dummy data, doesn't call ElevenLabs, DALL-E, or any paid APIs</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Before Testing:</strong> Make sure you've set up Firebase Storage and Firestore rules as described in FIREBASE-STORAGE-RULES.md
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
