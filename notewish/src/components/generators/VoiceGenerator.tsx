"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { uploadVoiceToStorage, saveCardToFirestore } from "@/lib/storage";

type ComponentStatus = "empty" | "generating" | "complete";

interface VoiceGeneratorProps {
  cardId: string;
  cardTitle: string;
  occasion: string;
  recipientName: string;
  personalMessage: string;
  templateId: string;
  status: ComponentStatus;
  setStatus: (status: ComponentStatus) => void;
}

export default function VoiceGenerator({
  cardId,
  cardTitle,
  occasion,
  recipientName,
  personalMessage,
  templateId,
  status,
  setStatus,
}: VoiceGeneratorProps) {
  // Voice generator options
  const [voiceText, setVoiceText] = useState("");
  const [voiceType, setVoiceType] = useState("female-professional");
  const [speakingStyle, setSpeakingStyle] = useState("natural");
  const [speed, setSpeed] = useState(1.0);
  const [generatedVoiceUrl, setGeneratedVoiceUrl] = useState<string | null>(null);

  // Handler for Voice generation
  const handleGenerateVoice = async () => {
    console.log('🎙️ [VOICE GEN] Starting voice generation...');
    
    if (!voiceText.trim()) {
      toast.error('Please provide text for voice generation');
      return;
    }

    setStatus('generating');
    const loadingToast = toast.loading('Generating your voice...');

    try {
      // Step 1: Generate voice with AI
      console.log('🎙️ [STEP 1] Calling ElevenLabs API...');
      const requestBody = {
        text: voiceText,
        voiceType: voiceType,
        speakingStyle: speakingStyle,
        speed: speed,
      };
      console.log('🎙️ [STEP 1] Request body:', requestBody);

      const response = await fetch('/api/generate/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('🎙️ [STEP 1] Response status:', response.status);
      const data = await response.json();
      console.log('🎙️ [STEP 1] Response data:', data);

      if (data.success && data.audioUrl) {
        console.log('🎙️ [STEP 1] ✅ Voice generated successfully!');
        
        toast.loading('Uploading to cloud storage...', { id: loadingToast });
        
        // Step 2: Upload to Firebase Storage
        console.log('🎙️ [STEP 2] Starting Firebase Storage upload...');
        const permanentUrl = await uploadVoiceToStorage(cardId, data.audioUrl);
        console.log('🎙️ [STEP 2] ✅ Upload successful!');
        console.log('🎙️ [STEP 2] Permanent URL:', permanentUrl);
        
        // Step 3: Save to Firestore
        console.log('🎙️ [STEP 3] Saving to Firestore...');
        const cardData = {
          id: cardId,
          title: cardTitle,
          occasion,
          recipientName,
          personalMessage,
          templateId,
          assets: {
            voiceUrl: permanentUrl,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await saveCardToFirestore(cardData);
        console.log('🎙️ [STEP 3] ✅ Firestore save successful!');
        
        // Step 4: Update local state
        setStatus('complete');
        setGeneratedVoiceUrl(permanentUrl);
        
        console.log('🎙️ [SUCCESS] 🎉 Voice generation completed!');
        toast.success('Voice generated and saved successfully!', { id: loadingToast });
      } else {
        console.error('🎙️ [STEP 1] ❌ API returned failure:', data);
        throw new Error(data.error || 'Failed to generate voice');
      }
    } catch (error: any) {
      console.error('🎙️ [ERROR] ❌ Voice generation failed!');
      console.error('🎙️ [ERROR] Error message:', error.message);
      console.error('🎙️ [ERROR] Full error object:', error);
      setStatus('empty');
      toast.error(error.message || 'Failed to generate voice', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Voice Generation
        </h2>
        <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] flex items-center gap-2">
          <span className="text-purple-500">🎙️</span>
          Create natural voice with AI
        </p>
      </div>

      {/* Voice Message Text */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Voice Message Text
        </label>
        <textarea
          value={voiceText}
          onChange={(e) => setVoiceText(e.target.value)}
          placeholder="Enter the text to be spoken..."
          rows={4}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-[family-name:var(--font-inter)]"
        />
      </div>

      {/* Voice Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Voice Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
            Voice Type
          </label>
          <div className="space-y-2">
            {[
              { value: "female-professional", label: "Female - Professional" },
              { value: "male-casual", label: "Male - Casual" },
              { value: "neutral", label: "Neutral" },
              { value: "energetic", label: "Energetic" }
            ].map((voice) => (
              <button
                key={voice.value}
                onClick={() => setVoiceType(voice.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                  voiceType === voice.value
                    ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {voice.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speaking Style */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
            Speaking Style
          </label>
          <div className="space-y-2">
            {[
              { value: "natural", label: "Natural" },
              { value: "expressive", label: "Expressive" },
              { value: "calm", label: "Calm" },
              { value: "energetic", label: "Energetic" }
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => setSpeakingStyle(style.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                  speakingStyle === style.value
                    ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Speed */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
          Speed
        </label>
        <div className="flex gap-3">
          {[
            { value: 0.75, label: "Slow (0.75x)" },
            { value: 1.0, label: "Normal (1.0x)" },
            { value: 1.25, label: "Fast (1.25x)" }
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setSpeed(s.value)}
              className={`px-4 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                speed === s.value
                  ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t border-gray-100">
        <button
          onClick={handleGenerateVoice}
          disabled={!voiceText.trim() || status === 'generating'}
          className="w-full py-3 rounded-lg text-base font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'generating' ? 'Generating...' : 'Generate Voice'}
        </button>
      </div>

      {/* Output Area */}
      <div className="mt-8">
        {generatedVoiceUrl ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎙️</span>
              <h3 className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                Your Generated Voice
              </h3>
            </div>
            
            {/* Audio Player */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <audio 
                controls 
                className="w-full"
                src={generatedVoiceUrl}
              >
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={handleGenerateVoice}
                className="flex-1 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-all font-[family-name:var(--font-poppins)]"
              >
                ↻ Regenerate
              </button>
              <button 
                onClick={() => {
                  setGeneratedVoiceUrl(null);
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
              Generated voice will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
