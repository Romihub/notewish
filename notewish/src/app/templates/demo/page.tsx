"use client";

import { useState } from "react";
import {
  MinimalistMessageTemplate,
  ClassicPhotoCardTemplate,
  RomanticMusicCardTemplate,
  VoiceMessageCardTemplate,
  UltimateExperienceTemplate,
} from "@/components/templates/TemplatePrototypes";

export default function TemplateDemoPage() {
  const [activeTemplate, setActiveTemplate] = useState(1);

  // Sample data for demos
  const sampleData = {
    message: "Wishing you a day filled with love, laughter, and all the joy your heart can hold. You deserve nothing but the best!",
    shortMessage: "Happy Birthday! 🎉",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
    voiceUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Sample audio
    musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", // Sample music
  };

  const templates = [
    {
      id: 1,
      name: "Minimalist Message",
      description: "MESSAGE only - Clean & simple",
      assets: "MESSAGE",
    },
    {
      id: 2,
      name: "Classic Photo Card",
      description: "MESSAGE + IMAGE - Traditional card style",
      assets: "MESSAGE + IMAGE",
    },
    {
      id: 3,
      name: "Romantic Music Card",
      description: "MESSAGE + IMAGE + MUSIC - With background music",
      assets: "MESSAGE + IMAGE + MUSIC",
    },
    {
      id: 4,
      name: "Voice Message Card",
      description: "MESSAGE + IMAGE + VOICE - Interactive voice greeting",
      assets: "MESSAGE + IMAGE + VOICE",
    },
    {
      id: 5,
      name: "Ultimate Experience",
      description: "ALL ASSETS - Premium full experience",
      assets: "MESSAGE + IMAGE + VOICE + MUSIC",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
            Template Prototypes Demo
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-[family-name:var(--font-inter)]">
            Browse and preview all 5 template designs with different asset combinations
          </p>
        </div>

        {/* Template Selector */}
        <div className="px-6 pb-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setActiveTemplate(template.id)}
                className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                  activeTemplate === template.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-left">
                  <p
                    className={`text-sm font-semibold font-[family-name:var(--font-poppins)] ${
                      activeTemplate === template.id
                        ? "text-purple-600"
                        : "text-gray-900"
                    }`}
                  >
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 font-[family-name:var(--font-inter)]">
                    {template.assets}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Preview */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)]">
                  {templates[activeTemplate - 1].name}
                </h2>
                <p className="text-sm text-white/90 font-[family-name:var(--font-inter)]">
                  {templates[activeTemplate - 1].description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  Template {activeTemplate} of {templates.length}
                </span>
              </div>
            </div>
          </div>

          {/* Template Display */}
          <div className="h-[600px] overflow-hidden">
            {activeTemplate === 1 && (
              <MinimalistMessageTemplate
                message={sampleData.message}
                occasion="Happy Birthday"
              />
            )}

            {activeTemplate === 2 && (
              <ClassicPhotoCardTemplate
                message={sampleData.message}
                imageUrl={sampleData.imageUrl}
                occasion="Happy Birthday"
              />
            )}

            {activeTemplate === 3 && (
              <RomanticMusicCardTemplate
                message={sampleData.message}
                imageUrl={sampleData.imageUrl}
                musicUrl={sampleData.musicUrl}
                occasion="With Love"
              />
            )}

            {activeTemplate === 4 && (
              <VoiceMessageCardTemplate
                message={sampleData.message}
                imageUrl={sampleData.imageUrl}
                voiceUrl={sampleData.voiceUrl}
                senderName="Your Friend"
              />
            )}

            {activeTemplate === 5 && (
              <UltimateExperienceTemplate
                message={sampleData.message}
                imageUrl={sampleData.imageUrl}
                voiceUrl={sampleData.voiceUrl}
                musicUrl={sampleData.musicUrl}
                occasion="A Special Moment"
              />
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 font-[family-name:var(--font-poppins)]">
            💡 How Templates Work
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 font-[family-name:var(--font-inter)]">
            <li>• Each template supports different combinations of AI-generated assets</li>
            <li>• Click buttons in Template 3, 4, and 5 to test interactive features</li>
            <li>• Templates automatically adapt to available assets</li>
            <li>• All templates are production-ready and can be customized</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
