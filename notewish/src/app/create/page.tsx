"use client";

import { useState } from "react";
import Link from "next/link";

type TemplateType = "card" | "video" | "interactive" | "slideshow";

interface Template {
  id: string;
  name: string;
  type: TemplateType;
  thumbnail: string;
  description: string;
  features: string[];
  isPremium?: boolean;
}

export default function TemplateSelection() {
  const [selectedType, setSelectedType] = useState<TemplateType | "all">("all");

  const templates: Template[] = [
    {
      id: "general-flipbook-mini-01",
      name: "Flipbook Mini",
      type: "interactive",
      thumbnail: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=300&fit=crop",
      description: "Interactive flipbook card with message variations and background music",
      features: ["AI Messages", "Background Music", "Page Flip Animation"],
    },
    {
      id: "birthday-sparkle",
      name: "Birthday Sparkle",
      type: "card",
      thumbnail: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
      description: "Animated birthday card with confetti and sparkles",
      features: ["AI Text", "AI Image", "Background Music"],
    },
    {
      id: "celebration-video",
      name: "Celebration Video",
      type: "video",
      thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
      description: "15-second animated video with AI-generated scenes",
      features: ["AI Video", "AI Voice", "Music"],
      isPremium: true,
    },
    {
      id: "love-letter",
      name: "Love Letter",
      type: "card",
      thumbnail: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop",
      description: "Romantic letter with handwritten-style text",
      features: ["AI Poem", "Romantic Background", "Voice Message"],
    },
    {
      id: "interactive-page",
      name: "Magic Page",
      type: "interactive",
      thumbnail: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=300&fit=crop",
      description: "Interactive web page with multiple sections",
      features: ["Multiple Sections", "Animations", "Music Player"],
      isPremium: true,
    },
    {
      id: "thank-you-card",
      name: "Gratitude Card",
      type: "card",
      thumbnail: "https://images.unsplash.com/photo-1563207153-f403bf289096?w=400&h=300&fit=crop",
      description: "Beautiful thank you card with floral elements",
      features: ["AI Text", "Floral Design", "Soft Music"],
    },
    {
      id: "memory-slideshow",
      name: "Memory Slideshow",
      type: "slideshow",
      thumbnail: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=300&fit=crop",
      description: "Photo slideshow with AI-generated captions",
      features: ["Photo Upload", "AI Captions", "Transitions"],
    },
    {
      id: "get-well-soon",
      name: "Healing Wishes",
      type: "card",
      thumbnail: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop",
      description: "Comforting card with calming colors",
      features: ["AI Message", "Soothing Colors", "Gentle Music"],
    },
    {
      id: "congrats-confetti",
      name: "Confetti Blast",
      type: "video",
      thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
      description: "Energetic congratulations video",
      features: ["AI Video", "Celebration Effects", "Upbeat Music"],
      isPremium: true,
    },
  ];

  const filterTypes: { value: TemplateType | "all"; label: string }[] = [
    { value: "all", label: "All Templates" },
    { value: "card", label: "Cards" },
    { value: "video", label: "Videos" },
    { value: "interactive", label: "Interactive" },
    { value: "slideshow", label: "Slideshow" },
  ];

  const filteredTemplates = selectedType === "all" 
    ? templates 
    : templates.filter(t => t.type === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-inter)]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-base font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                Back to Home
              </span>
            </Link>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium font-[family-name:var(--font-poppins)]">
              Preview Examples
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
            Choose Your Template
          </h1>
          <p className="text-gray-600 font-[family-name:var(--font-inter)]">
            Select a beautiful template to bring your moment to life
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {filterTypes.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedType(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap font-[family-name:var(--font-poppins)] ${
                selectedType === filter.value
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <Link
              key={template.id}
              href={`/create/${template.id}`}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all">
                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm font-[family-name:var(--font-poppins)]">
                    Premium
                  </div>
                )}

                {/* Thumbnail */}
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 font-[family-name:var(--font-poppins)]">
                    {template.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 font-[family-name:var(--font-inter)]">
                    {template.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5">
                    {template.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium font-[family-name:var(--font-inter)]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-sm text-gray-500 font-[family-name:var(--font-inter)]">
              No templates found for this category. Try another filter!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
