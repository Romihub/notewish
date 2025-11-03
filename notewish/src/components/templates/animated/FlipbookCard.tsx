"use client";

import { useState } from "react";
import { TemplateContent } from "@/types/template";

interface FlipbookCardProps extends TemplateContent {
  occasion?: string;
}

export function FlipbookCard({
  text,
  title,
  image,
  video,
  music,
  voice,
  occasion = "Special Day"
}: FlipbookCardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isBgMusicMuted, setIsBgMusicMuted] = useState(false);
  const totalPages = 6;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Content */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: '600px' }}>
        
        {/* Page 1 - Cover with Background Video (unmuted with control) */}
        {currentPage === 0 && (
          <div className="w-full h-full relative">
            {video && (
              <video 
                src={video} 
                autoPlay 
                loop 
                muted={isVideoMuted}
                playsInline 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            )}
            {image && !video && (
              <img src={image} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {!image && !video && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500" />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-8">
              <h1 className="text-white text-4xl font-bold text-center">{title || occasion}</h1>
            </div>
            
            {/* Mute control for background video - Top right corner */}
            {video && (
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition text-xl z-20"
                title={isVideoMuted ? 'Unmute Video' : 'Mute Video'}
              >
                {isVideoMuted ? '🔇' : '🔊'}
              </button>
            )}
          </div>
        )}

        {/* Page 2 - Text with Background Music (actually playing) */}
        {currentPage === 1 && (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 p-12 flex items-center justify-center relative">
            {/* Background music - plays on this page */}
            {music && <audio src={music} autoPlay loop muted={isBgMusicMuted} className="hidden" />}
            
            <p className="text-gray-800 text-xl text-center italic leading-relaxed">{text}</p>
            
            {/* Mute control for background music - Top right corner */}
            {music && (
              <button
                onClick={() => setIsBgMusicMuted(!isBgMusicMuted)}
                className="absolute top-4 right-4 p-3 bg-purple-600/80 text-white rounded-full hover:bg-purple-700 transition text-xl z-20"
                title={isBgMusicMuted ? 'Unmute Music' : 'Mute Music'}
              >
                {isBgMusicMuted ? '🔇' : '🎵'}
              </button>
            )}
          </div>
        )}

        {/* Page 3 - Image Only */}
        {currentPage === 2 && (
          <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-pink-50 p-8 flex flex-col items-center justify-center">
            <h3 className="text-gray-800 text-2xl font-bold mb-6">Captured Moments</h3>
            {image && (
              <img 
                src={image} 
                alt="moment" 
                className="w-full h-auto max-h-96 object-cover rounded-xl shadow-lg" 
              />
            )}
          </div>
        )}

        {/* Page 4 - Video Player */}
        {currentPage === 3 && (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 p-8 flex flex-col items-center justify-center">
            <h3 className="text-gray-800 text-2xl font-bold mb-6">Our Beautiful Moment</h3>
            {video && (
              <video src={video} controls className="w-full rounded-xl shadow-lg" />
            )}
          </div>
        )}

        {/* Page 5 - Voice Message */}
        {currentPage === 4 && (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 p-8 flex flex-col items-center justify-center">
            <h3 className="text-gray-800 text-2xl font-bold mb-6">A Message For You</h3>
            {voice && (
              <audio src={voice} controls className="w-3/4" />
            )}
            <div className="mt-8 text-6xl">💌</div>
          </div>
        )}

        {/* Page 6 - Closing/Thank You */}
        {currentPage === 5 && (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-12 flex flex-col items-center justify-center">
            <h2 className="text-white text-3xl font-bold text-center mb-4">Thank You! 💕</h2>
            <p className="text-white/90 text-center text-lg">
              This card was made with love
            </p>
            <div className="mt-8 text-6xl">✨</div>
          </div>
        )}
      </div>

      {/* Navigation - ALWAYS VISIBLE */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition"
        >
          ← PREV
        </button>

        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-3 h-3 rounded-full transition ${
                page === currentPage ? 'bg-purple-600 w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition"
        >
          NEXT →
        </button>
      </div>

      {/* Debug Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  );
}
