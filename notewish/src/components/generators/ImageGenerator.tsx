"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { uploadImageToStorage, saveCardToFirestore } from "@/lib/storage";
import { useCardStore } from "@/store/useCardStore";

type ComponentStatus = "empty" | "generating" | "complete";

interface ImageGeneratorProps {
  cardId: string;
  cardTitle: string;
  occasion: string;
  recipientName: string;
  personalMessage: string;
  templateId: string;
  status: ComponentStatus;
  setStatus: (status: ComponentStatus) => void;
}

export default function ImageGenerator({
  cardId,
  cardTitle,
  occasion,
  recipientName,
  personalMessage,
  templateId,
  status,
  setStatus,
}: ImageGeneratorProps) {
  // Zustand store
  const { setGeneratedImage } = useCardStore();
  
  // Image generator options
  const [imageDescription, setImageDescription] = useState("");
  const [artStyle, setArtStyle] = useState("photorealistic");
  const [customArtStyle, setCustomArtStyle] = useState("");
  const [hint, setHint] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

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

  // AI-assisted prompt generation using secure server API
  const handleGeneratePrompt = async () => {
    if (!occasion && !recipientName && !personalMessage) {
      toast.error('Please fill in card details first (occasion, recipient, or message)');
      return;
    }

    setIsGeneratingPrompt(true);
    const loadingToast = toast.loading('Generating image prompt with OpenAI...');

    try {
      console.log('🎨 [AI PROMPT] Calling secure API route...');
      
      // Call secure server API route for prompt generation
      const response = await fetch('/api/generate/image-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          occasion,
          recipientName,
          personalMessage,
          artStyle: artStyle === 'custom' ? customArtStyle : artStyle,
          hint,
          referenceImage,
        }),
      });

      const data = await response.json();
      console.log('🎨 [AI PROMPT] API response:', data);

      if (data.success && data.prompt) {
        setImageDescription(data.prompt);
        console.log('🎨 [AI PROMPT] ✅ Generated prompt:', data.prompt);
        toast.success('AI prompt generated!', { id: loadingToast });
      } else {
        throw new Error(data.error || 'Failed to generate prompt');
      }
    } catch (error: any) {
      console.error('🎨 [AI PROMPT] ❌ Error:', error);
      toast.error(`Failed to generate AI prompt: ${error.message}`, { id: loadingToast });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Handler for Image generation
  const handleGenerateImage = async () => {
    console.log('🎨 [IMAGE GEN] Starting image generation...');
    
    if (!imageDescription.trim()) {
      toast.error('Please provide an image description');
      return;
    }

    setStatus('generating');
    const loadingToast = toast.loading('Generating your image...');

    try {
      // Step 1: Generate image with AI
      console.log('🎨 [STEP 1] Calling Image Generation API...');
      const genResponse = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: imageDescription,
          style: artStyle,
          aspectRatio,
          referenceImage,
        }),
      });
      const genData = await genResponse.json();

      if (!genData.success) {
        throw new Error(genData.error || 'Failed to generate image');
      }
      console.log('🎨 [STEP 1] ✅ Image generated successfully!');
      
      // Step 2: Upload image via secure API route
      toast.loading('Uploading to cloud storage...', { id: loadingToast });
      console.log('🎨 [STEP 2] Calling Upload API...');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, imageUrl: genData.imageUrl }),
      });
      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload image');
      }
      const permanentUrl = uploadData.permanentUrl;
      console.log('🎨 [STEP 2] ✅ Upload successful! URL:', permanentUrl);

      // Step 3: Save to Firestore
      console.log('🎨 [STEP 3] Saving to Firestore...');
      const cardData = {
        id: cardId,
        title: cardTitle,
        occasion,
        recipientName,
        personalMessage,
        templateId,
        assets: {
          imageUrl: permanentUrl,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await saveCardToFirestore(cardData);
      console.log('🎨 [STEP 3] ✅ Firestore save successful!');
      
      // Step 4: Update Zustand store
      setGeneratedImage(permanentUrl);
      
      // Step 5: Update local state
      setStatus('complete');
      setGeneratedImageUrl(permanentUrl);
      
      console.log('🎨 [SUCCESS] 🎉 Image generation completed!');
      toast.success('Image generated and saved successfully!', { id: loadingToast });

    } catch (error: any) {
      console.error('🎨 [ERROR] ❌ Image generation failed!');
      console.error('🎨 [ERROR] Error message:', error.message);
      console.error('🎨 [ERROR] Full error object:', error);
      setStatus('empty');
      toast.error(error.message || 'Failed to generate image', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Image Generation
        </h2>
        <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] flex items-center gap-2">
          <span className="text-purple-500">🎨</span>
          Create stunning visuals with AI
        </p>
      </div>

      {/* Reference Upload */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Reference Image (Optional)
        </label>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-reference-upload')?.click()}
        >
          <input
            id="image-reference-upload"
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
              Drag & drop or click to upload reference image
            </div>
          )}
        </div>
      </div>

      {/* Image Description */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
            Image Description
          </label>
          <button
            onClick={handleGeneratePrompt}
            disabled={isGeneratingPrompt}
            className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-[family-name:var(--font-poppins)]"
          >
            {isGeneratingPrompt ? '✨ Generating...' : '✨ Generate with AI'}
          </button>
        </div>
        <textarea
          value={imageDescription}
          onChange={(e) => setImageDescription(e.target.value)}
          placeholder="Describe in detail... lighting, mood, colors, composition, subject"
          rows={4}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-[family-name:var(--font-inter)]"
        />
        <p className="text-xs text-gray-500 mt-1.5 font-[family-name:var(--font-inter)]">
          💡 Tip: Click "Generate with AI" to create a prompt based on your card details
        </p>
      </div>

      {/* Hint Box */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Additional Hint (Optional)
        </label>
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Example hint: 'A birthday card for my mom, she loves cats and the color blue'"
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-[family-name:var(--font-inter)]"
        />
        <p className="text-xs text-gray-500 mt-1.5 font-[family-name:var(--font-inter)]">
          Further guide the AI by providing a specific subject or theme.
        </p>
      </div>

      {/* Art Style Grid */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
          Art Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "photorealistic", label: "Photorealistic" },
            { value: "cartoon", label: "Cartoon" },
            { value: "anime", label: "Anime/Manga" },
            { value: "3d", label: "3D Render" },
            { value: "watercolor", label: "Watercolor" },
            { value: "oil", label: "Oil Painting" },
            { value: "sketch", label: "Sketch" },
            { value: "custom", label: "Custom Style..." }
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => setArtStyle(style.value)}
              className={`px-3 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                artStyle === style.value
                  ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
        {artStyle === 'custom' && (
          <div className="mt-3">
            <input
              type="text"
              value={customArtStyle}
              onChange={(e) => setCustomArtStyle(e.target.value)}
              placeholder="e.g., 'in the style of Van Gogh'"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-[family-name:var(--font-inter)]"
            />
          </div>
        )}
      </div>

      {/* Aspect Ratio */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
          Aspect Ratio
        </label>
        <div className="flex gap-3">
          {["16:9", "4:3", "1:1", "9:16", "3:4"].map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-4 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                aspectRatio === ratio
                  ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t border-gray-100">
        <button
          onClick={handleGenerateImage}
          disabled={!imageDescription.trim() || status === 'generating'}
          className="w-full py-3 rounded-lg text-base font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'generating' ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {/* Output Area */}
      <div className="mt-8">
        {generatedImageUrl ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎨</span>
              <h3 className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                Your Generated Image
              </h3>
            </div>
            
            {/* Image Display */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <img 
                src={generatedImageUrl}
                alt="Generated"
                className="w-full rounded-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={handleGenerateImage}
                className="flex-1 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-all font-[family-name:var(--font-poppins)]"
              >
                ↻ Regenerate
              </button>
              <button 
                onClick={() => {
                  setGeneratedImageUrl(null);
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
              Generated images will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
