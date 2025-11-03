"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { saveCardToFirestore } from "@/lib/storage";
import { useCardStore } from "@/store/useCardStore";

type ComponentStatus = "empty" | "generating" | "complete";

interface MessageGeneratorProps {
  cardId: string;
  cardTitle: string;
  occasion: string;
  recipientName: string;
  greetings: string;
  personalMessage: string;
  templateId: string;
  status: ComponentStatus;
  setStatus: (status: ComponentStatus) => void;
}

export default function MessageGenerator({
  cardId,
  cardTitle,
  occasion,
  recipientName,
  greetings,
  personalMessage,
  templateId,
  status,
  setStatus,
}: MessageGeneratorProps) {
  // Zustand store
  const { setGeneratedMessageVariations } = useCardStore();
  
  // Saved message state
  const [savedMessage, setSavedMessage] = useState<string>('');
  // Message generator options
  const [messageStyle, setMessageStyle] = useState("heartfelt");
  const [messageLength, setMessageLength] = useState("medium");
  const [messageTone, setMessageTone] = useState("warm");
  const [customPrompt, setCustomPrompt] = useState("");
  
  // AI Suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Generate message suggestions with AI
  const handleGenerateWithDeepSeek = async () => {
    setIsGeneratingSuggestions(true);
    const loadingToast = toast.loading('Generating message variations...');
    
    try {
      console.log('📝 [MESSAGE GEN] Generating 5 variations...');
      
      // Generate 5 variations
      const suggestionPromises = Array(5).fill(null).map(() =>
        fetch('/api/generate/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            occasion,
            recipientName,
            personalMessage,
            style: messageStyle,
            tone: messageTone,
            length: messageLength,
          }),
        }).then(res => res.json())
      );

      const results = await Promise.all(suggestionPromises);
      const newSuggestions = results
        .filter(r => r.success)
        .map(r => r.message);

      if (newSuggestions.length > 0) {
        console.log('📝 [MESSAGE GEN] ✅ Generated', newSuggestions.length, 'DRAFT suggestions!');
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
        
        // DON'T save to Zustand yet - these are just drafts!
        // User needs to select which ones they want first
        
        toast.success('Generated 5 draft suggestions! Select which ones to use.', { id: loadingToast });
      } else {
        throw new Error('No messages generated');
      }
    } catch (error) {
      console.error('📝 [ERROR] ❌ Message generation failed:', error);
      // Fallback to mock data on error
      setSuggestions([
        "Happy birthday! Wishing you all the best on your special day.",
        "May your day be filled with joy, laughter, and wonderful memories.",
      ]);
      setShowSuggestions(true);
      toast.error('Failed to generate messages', { id: loadingToast });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Message Generation
        </h2>
        <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] flex items-center gap-2">
          <span className="text-purple-500">✨</span>
          Create message with AI
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Style */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
            Style
          </label>
          <div className="space-y-2">
            {[
              { value: "heartfelt", label: "Heartfelt & Emotional" },
              { value: "funny", label: "Funny & Lighthearted" },
              { value: "poetic", label: "Poetic & Romantic" },
              { value: "formal", label: "Formal & Professional" },
              { value: "casual", label: "Casual & Friendly" },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => setMessageStyle(style.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                  messageStyle === style.value
                    ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
            Length
          </label>
          <div className="space-y-2">
            {[
              { value: "short", label: "Short", desc: "1-2 sentences" },
              { value: "medium", label: "Medium", desc: "A paragraph" },
              { value: "long", label: "Long", desc: "Multiple paragraphs" },
            ].map((length) => (
              <button
                key={length.value}
                onClick={() => setMessageLength(length.value)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
                  messageLength === length.value
                    ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className={`text-sm font-medium font-[family-name:var(--font-poppins)] ${
                  messageLength === length.value ? "text-white" : "text-gray-900"
                }`}>
                  {length.label}
                </div>
                <div className={`text-xs font-[family-name:var(--font-inter)] ${
                  messageLength === length.value ? "text-gray-300" : "text-gray-500"
                }`}>
                  {length.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 font-[family-name:var(--font-poppins)]">
            Tone
          </label>
          <div className="space-y-2">
            {[
              { value: "warm", label: "Warm" },
              { value: "playful", label: "Playful" },
              { value: "sincere", label: "Sincere" },
              { value: "humorous", label: "Humorous" },
              { value: "inspirational", label: "Inspirational" },
            ].map((tone) => (
              <button
                key={tone.value}
                onClick={() => setMessageTone(tone.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                  messageTone === tone.value
                    ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {tone.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* YOUR CARD MESSAGE - Required Field */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
            Your Card Message <span className="text-red-500">*</span>
          </label>
          <button
            onClick={handleGenerateWithDeepSeek}
            disabled={isGeneratingSuggestions}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-poppins)]"
          >
            {isGeneratingSuggestions ? (
              <>
                <span className="animate-spin">⏳</span>
                Thinking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Generate with DeepSeek
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-2 font-[family-name:var(--font-inter)]">
          Type your message here, or use AI to generate suggestions
        </p>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Type your heartfelt message here... (or click 'Generate with DeepSeek' above for AI suggestions)"
          rows={6}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-[family-name:var(--font-inter)]"
        />
      </div>

      {/* AI Suggestions Display - SELECT ONE */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
              💡 AI Suggestions - Click to select one
            </h3>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomPrompt(suggestion);
                  setShowSuggestions(false);
                  toast.success('Message selected! You can edit it before saving.');
                }}
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-purple-500 font-semibold text-sm">#{idx + 1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed font-[family-name:var(--font-inter)] flex-1">
                    {suggestion}
                  </p>
                  <span className="text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Select →
                  </span>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerateWithDeepSeek}
            className="w-full mt-3 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium font-[family-name:var(--font-poppins)]"
          >
            ↻ Generate More Suggestions
          </button>
        </div>
      )}

      {/* Save Button - Saves ONLY the selected/edited message */}
      <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t border-gray-100">
        <button
          onClick={async () => {
            // Only save the message in customPrompt (either selected from AI or manually typed)
            if (!customPrompt.trim()) {
              toast.error('Please generate and select a message, or type one manually');
              return;
            }

            const loadingToast = toast.loading('Saving message...');
            try {
              const messageToSave = customPrompt.trim();
              console.log('📝 [SAVE] Saving single message:', messageToSave);
              
              // Step 1: Save to Zustand - ONLY ONE MESSAGE
              setGeneratedMessageVariations([messageToSave]);
              setSavedMessage(messageToSave);
              
              // Step 2: Save to Firestore
              console.log('📝 [SAVE] Saving to Firestore...');
              await saveCardToFirestore({
                id: cardId,
                title: cardTitle,
                occasion,
                recipientName,
                greetings,
                personalMessage,
                templateId,
                assets: {
                  messageVariations: [messageToSave],
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              console.log('📝 [SAVE] ✅ Firestore save successful!');
              
              setStatus("complete");
              toast.success('Message saved successfully!', { id: loadingToast });
            } catch (error: any) {
              console.error('📝 [SAVE] ❌ Save failed:', error);
              toast.error('Failed to save message', { id: loadingToast });
            }
          }}
          className="w-full py-3 rounded-lg text-base font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
        >
          Save Message
        </button>
      </div>

      {/* Output Area */}
      <div className="mt-8">
        {savedMessage ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💌</span>
              <h3 className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                Saved Message
              </h3>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed font-[family-name:var(--font-inter)]">
                {savedMessage}
              </p>
            </div>

            <button 
              onClick={() => {
                setCustomPrompt(savedMessage);
                setShowSuggestions(false);
              }}
              className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-all font-[family-name:var(--font-poppins)]"
            >
              ✏ Edit Message
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-500 font-[family-name:var(--font-inter)]">
              Saved message will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
