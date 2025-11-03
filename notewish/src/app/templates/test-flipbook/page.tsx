"use client";

import { FlipbookCard } from "@/components/templates/animated/FlipbookCard";

export default function TestFlipbookPage() {
  // Mock data for testing - with real sample media
  const mockData = {
    text: "Happy Anniversary 💕\n\nThrough every sunrise and sunset, you've been my constant. Every moment with you is a treasure, and I'm grateful for the beautiful journey we share together.",
    title: "Happy Anniversary",
    occasion: "Our Special Day",
    
    // Sample media URLs for testing
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    
    // Sample video - nature/celebration theme
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    
    // Sample background music - peaceful instrumental
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    
    // Sample voice message - you can replace with your own
    voice: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">FlipbookCard Test</h1>
          <p className="text-gray-400">Testing embedded media template with animations</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 pb-32">
          <FlipbookCard {...mockData} />
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-white text-lg font-semibold mb-4">Test Configuration</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>✅ Text Content:</span>
              <span className="text-green-400">Loaded</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>✅ Background Image:</span>
              <span className="text-green-400">Loaded (Unsplash)</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>✅ Video:</span>
              <span className="text-green-400">Loaded (Sample)</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>✅ Background Music:</span>
              <span className="text-green-400">Loaded (Sample)</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>✅ Voice Message:</span>
              <span className="text-green-400">Loaded (Sample)</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h3 className="text-white text-sm font-semibold mb-2">💡 To test with your media:</h3>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>Add your video URL to the <code className="text-purple-400">video</code> property</li>
              <li>Add your music MP3 URL to the <code className="text-purple-400">music</code> property</li>
              <li>Add your voice message URL to the <code className="text-purple-400">voice</code> property</li>
              <li>Media will be embedded inline within the card pages</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/create" 
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            ← Back to Templates
          </a>
        </div>
      </div>
    </div>
  );
}
