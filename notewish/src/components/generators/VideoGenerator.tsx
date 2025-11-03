"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { uploadVideoToStorage, saveCardToFirestore } from "@/lib/storage";

type ComponentStatus = "empty" | "generating" | "complete";

interface VideoGeneratorProps {
  cardId: string;
  cardTitle: string;
  occasion: string;
  recipientName: string;
  personalMessage: string;
  templateId: string;
  status: ComponentStatus;
  setStatus: (status: ComponentStatus) => void;
}

export default function VideoGenerator({
  cardId,
  cardTitle,
  occasion,
  recipientName,
  personalMessage,
  templateId,
  status,
  setStatus,
}: VideoGeneratorProps) {
  // Video generator options
  const [videoDescription, setVideoDescription] = useState("");
  const [videoStyle, setVideoStyle] = useState("realistic");
  const [cameraMovement, setCameraMovement] = useState("static");
  const [videoDuration, setVideoDuration] = useState(5);
  const [motionSpeed, setMotionSpeed] = useState(1.0);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedVideoPrompt, setGeneratedVideoPrompt] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
      toast.success('Reference image uploaded!');
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
      toast.success('Reference image uploaded!');
    };
    reader.readAsDataURL(file);
  };

  // Handler for Video generation
  const handleGenerateVideo = async () => {
    console.log('🎬 [VIDEO GEN] Starting video generation...');
    
    if (!videoDescription.trim()) {
      toast.error('Please provide a video description');
      return;
    }

    setStatus('generating');
    const loadingToast = toast.loading('Generating your video...');

    try {
      // Step 1: Generate video with AI
      console.log('🎬 [STEP 1] Calling video generation API...');
      const requestBody = {
        description: videoDescription,
        style: videoStyle,
        cameraMovement: cameraMovement,
        duration: videoDuration,
        motionSpeed: motionSpeed,
        referenceImage: referenceImage,
      };
      console.log('🎬 [STEP 1] Request body:', requestBody);

      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('🎬 [STEP 1] Response status:', response.status);
      const data = await response.json();
      console.log('🎬 [STEP 1] Response data:', data);

      if (data.success && data.videoUrl) {
        console.log('🎬 [STEP 1] ✅ Video generated successfully!');
        
        toast.loading('Uploading to cloud storage...', { id: loadingToast });
        
        // Step 2: Upload to Firebase Storage
        console.log('🎬 [STEP 2] Starting Firebase Storage upload...');
        const permanentUrl = await uploadVideoToStorage(cardId, data.videoUrl);
        console.log('🎬 [STEP 2] ✅ Upload successful!');
        console.log('🎬 [STEP 2] Permanent URL:', permanentUrl);
        
        // Step 3: Save to Firestore
        console.log('🎬 [STEP 3] Saving to Firestore...');
        const cardData = {
          id: cardId,
          title: cardTitle,
          occasion,
          recipientName,
          personalMessage,
          templateId,
          assets: {
            videoUrl: permanentUrl,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await saveCardToFirestore(cardData);
        console.log('🎬 [STEP 3] ✅ Firestore save successful!');
        
        // Step 4: Update local state
        setStatus('complete');
        setGeneratedVideoUrl(permanentUrl);
        setGeneratedVideoPrompt(data.prompt);
        
        console.log('🎬 [SUCCESS] 🎉 Video generation completed!');
        toast.success('Video generated and saved successfully!', { id: loadingToast });
      } else {
        console.error('🎬 [STEP 1] ❌ API returned failure:', data);
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (error: any) {
      console.error('🎬 [ERROR] ❌ Video generation failed!');
      console.error('🎬 [ERROR] Error message:', error.message);
      console.error('🎬 [ERROR] Full error object:', error);
      setStatus('empty');
      toast.error(error.message || 'Failed to generate video', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Video Generation
        </h2>
        <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] flex items-center gap-2">
          <span className="text-purple-500">🎬</span>
          Create AI-powered videos
        </p>
      </div>

      {/* Reference Uploads */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Reference Image (Optional)
        </label>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('video-reference-upload')?.click()}
        >
          <input
            id="video-reference-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {referenceImage ? (
            <div className="relative">
              <img 
                src={referenceImage} 
                alt="Reference" 
                className="max-h-48 mx-auto rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReferenceImage(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-sm font-[family-name:var(--font-inter)]">
              Upload reference image for first frame or style guide
            </div>
          )}
        </div>
      </div>

      {/* Video Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Video Description
        </label>
        <textarea
          value={videoDescription}
          onChange={(e) => setVideoDescription(e.target.value)}
          placeholder="Describe the scene, motion, camera movements, transitions..."
          rows={4}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-[family-name:var(--font-inter)]"
        />
      </div>

      {/* Style & Duration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Style Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
            Style
          </label>
          <div className="space-y-2">
            {["animated", "realistic", "3d", "cinematic", "abstract", "watercolor"].map((style) => (
              <button
                key={style}
                onClick={() => setVideoStyle(style)}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                  videoStyle === style
                    ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Movement */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
            Camera Movement
          </label>
          <div className="space-y-2">
            {[
              { value: "static", label: "Static" },
              { value: "pan", label: "Pan" },
              { value: "zoom", label: "Zoom In/Out" },
              { value: "rotate", label: "Rotate" },
              { value: "dolly", label: "Dolly" },
              { value: "dynamic", label: "Dynamic" }
            ].map((movement) => (
              <button
                key={movement.value}
                onClick={() => setCameraMovement(movement.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                  cameraMovement === movement.value
                    ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {movement.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
          Duration
        </label>
        <div className="flex gap-3">
          {[3, 5, 10, 15, 30].map((duration) => (
            <button
              key={duration}
              onClick={() => setVideoDuration(duration)}
              className={`px-4 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                videoDuration === duration
                  ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {duration}s
            </button>
          ))}
        </div>
      </div>

      {/* Motion Speed */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
          Motion Speed
        </label>
        <div className="flex gap-3">
          {[
            { value: 0.5, label: "Slow (0.5x)" },
            { value: 1.0, label: "Normal (1.0x)" },
            { value: 1.5, label: "Fast (1.5x)" },
            { value: 2.0, label: "Time-lapse (2x)" }
          ].map((speed) => (
            <button
              key={speed.value}
              onClick={() => setMotionSpeed(speed.value)}
              className={`px-4 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                motionSpeed === speed.value
                  ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t border-gray-100">
        <button
          onClick={handleGenerateVideo}
          disabled={!videoDescription.trim() || status === 'generating'}
          className="w-full py-3 rounded-lg text-base font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'generating' ? 'Generating...' : 'Generate Video'}
        </button>
      </div>

      {/* Output Area */}
      <div className="mt-8">
        {generatedVideoUrl ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎬</span>
              <h3 className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                Your Generated Video
              </h3>
            </div>
            
            {/* Video Player */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <video 
                controls 
                className="w-full rounded-lg"
                src={generatedVideoUrl}
              >
                Your browser does not support the video element.
              </video>
            </div>

            {/* Video Details */}
            {generatedVideoPrompt && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2 font-[family-name:var(--font-poppins)]">
                  Video Prompt:
                </p>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                  {generatedVideoPrompt}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={handleGenerateVideo}
                className="flex-1 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-all font-[family-name:var(--font-poppins)]"
              >
                ↻ Regenerate
              </button>
              <button 
                onClick={() => {
                  setGeneratedVideoUrl(null);
                  setGeneratedVideoPrompt(null);
                  setStatus('empty');
                }}
                className="flex-1 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all font-[family-name:var(--font-poppins)]"
              >
                ✕ Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-500 font-[family-name:var(--font-inter)]">
              Generated videos will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
