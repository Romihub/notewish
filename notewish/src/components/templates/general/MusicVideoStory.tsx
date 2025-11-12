"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Music2 } from "lucide-react";
import { TemplateProps, TemplateRenderer } from "../../../types/template";
import { SongPlayer } from "../../ui/SongPlayer";

const MusicVideoStoryTemplate = forwardRef<TemplateRenderer, TemplateProps>(({
  cardId,
  occasion,
  messageVariations,
  videoUrl,
  songUrl,
  songTitle,
  recipientName,
  greetings,
  personalMessage,
  mode = "view",
  initialPage = 0,
}, ref) => {
  const isVideoMode = mode === "video";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [showHint, setShowHint] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Use ONLY the user's final saved message
  const userMessage = messageVariations && messageVariations.length > 0 ? messageVariations[0] : null;
  const hasVideo = !!videoUrl;
  const hasSong = !!songUrl;
  const hasMessage = !!userMessage;
  
  // Calculate total pages based on available content
  const totalPages = 1 + (hasVideo ? 1 : 0) + (hasSong ? 1 : 0) + (hasMessage ? 1 : 0);
  const rootRef = useRef<HTMLDivElement>(null);
  
  // In video mode, use fixed page instead of state
  const displayPage = isVideoMode ? initialPage : currentPage;

  // Expose the renderer API via ref
  useImperativeHandle(ref, () => ({
    setPage: setCurrentPage,
    getTotalPages: () => totalPages,
  }), [totalPages]);

  // Also attach to the DOM element for puppeteer
  useEffect(() => {
    if (rootRef.current) {
      (rootRef.current as any).renderer = {
        setPage: setCurrentPage,
        getTotalPages: () => totalPages,
      };
    }
  }, [totalPages]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setShowHint(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  return (
    <div ref={rootRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background - gradient with musical notes */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 40%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(96, 165, 250, 0.2) 0%, transparent 50%)
            `,
            backgroundSize: '300px 300px, 250px 250px, 200px 200px',
            backgroundPosition: '0 0, 50% 50%, 100% 100%',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Musical notes pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.4, 0.1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
              }}
            >
              <Music2 className="w-4 h-4 text-purple-300" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Card Container */}
      <div className="relative z-10">
        <div
          data-template-root="true"
          className="relative"
          style={{
            width: "480px",
            height: "640px",
          }}
        >
          <AnimatePresence mode="wait">
            {/* Cover Page */}
            {displayPage === 0 && (
              <motion.div
                key="cover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer overflow-hidden"
                onClick={isVideoMode ? undefined : handleNextPage}
              >
                <div className="w-full h-full relative bg-gradient-to-br from-purple-700 via-blue-600 to-pink-700">
                  {/* Decorative overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-pink-900/20" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-6"
                    >
                      <Music2 className="w-20 h-20 text-white opacity-80" />
                    </motion.div>
                    
                    <h1 className="text-white drop-shadow-2xl text-6xl leading-tight mb-6 font-[family-name:var(--font-playfair)] text-center">
                      {greetings || `Happy ${occasion}!`}
                    </h1>
                    
                    {recipientName && (
                      <p className="text-purple-100 text-3xl font-light">
                        To {recipientName}
                      </p>
                    )}
                    
                    {personalMessage && (
                      <p className="text-purple-50 text-lg mt-6 italic max-w-md text-center">
                        "{personalMessage}"
                      </p>
                    )}
                  </div>

                  {/* Golden border */}
                  <div className="absolute inset-6 border-2 border-pink-400/40 rounded-2xl pointer-events-none" />
                  
                  {/* Tap hint */}
                  <AnimatePresence>
                    {!isVideoMode && showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                      >
                        <div className="px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-pink-300/50 shadow-lg">
                          <span className="text-sm text-purple-900">Tap to continue</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Video Page */}
            {(hasVideo && displayPage === 1) && (
              <motion.div
                key="video"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer overflow-hidden"
                onClick={isVideoMode ? undefined : (isVideoPlaying ? handleNextPage : (e) => {
                  e.stopPropagation();
                  setIsVideoPlaying(true);
                })}
              >
                <div className="w-full h-full relative bg-gradient-to-br from-black via-purple-900 to-black">
                  {/* Video player */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl relative">
                      <div className="absolute inset-0 bg-black">
                        {isVideoPlaying ? (
                          <video
                            src={videoUrl}
                            autoPlay
                            controls
                            className="w-full h-full object-contain"
                            onEnded={handleNextPage}
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-transparent to-pink-900/50 flex items-center justify-center">
                              <div className="text-center p-8">
                                <h3 className="text-white text-2xl font-semibold mb-4">Watch Your Special Video</h3>
                                <Music2 className="w-16 h-16 text-white mx-auto opacity-70 mb-4" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsVideoPlaying(true);
                                  }}
                                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
                                >
                                  <Play className="w-5 h-5" />
                                  <span>Play Video</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Decorative border */}
                      <div className="absolute inset-0 border-2 border-purple-400/50 rounded-2xl pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Message Page */}
            {(hasMessage && displayPage === (hasVideo ? 2 : 1)) && (
              <motion.div
                key="message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer overflow-hidden"
                onClick={isVideoMode ? undefined : handleNextPage}
              >
                <div className="w-full h-full relative bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-12 flex flex-col justify-center">
                  {/* Decorative quote marks */}
                  <div className="absolute top-8 left-8 text-7xl text-purple-300/60 font-serif leading-none">"</div>
                  <div className="absolute bottom-8 right-8 text-7xl text-pink-300/60 font-serif leading-none">"</div>
                  
                  <p className="text-center text-purple-900 leading-relaxed italic px-8 text-xl font-[family-name:var(--font-playfair)] z-10">
                    {userMessage}
                  </p>
                  
                  {/* Decorative border */}
                  <div className="absolute inset-6 border border-purple-300/50 rounded-2xl pointer-events-none" />
                </div>
              </motion.div>
            )}

            {/* Music Player Page */}
            {(hasSong && displayPage === totalPages - 1) && (
              <motion.div
                key="music"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="w-full h-full relative bg-gradient-to-br from-purple-800 via-blue-800 to-pink-800 p-12 flex flex-col items-center justify-center">
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white text-3xl font-serif">
                    Enjoy Your Song
                  </div>
                  
                  <SongPlayer 
                    src={songUrl} 
                    title={songTitle || "Your Special Song"} 
                    artist="NoteWish"
                  />
                  
                  {/* Decorative border */}
                  <div className="absolute inset-6 border border-pink-400/50 rounded-2xl pointer-events-none" />
                  
                  {!isVideoMode && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-purple-100 text-sm">
                      <p>Press any key to close</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation dots */}
      {!isVideoMode && totalPages > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/90 backdrop-blur-md border border-pink-300/50 shadow-lg">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  currentPage === idx
                    ? 'w-12 h-4 bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'w-4 h-4 bg-purple-400/60 hover:bg-purple-500'
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

MusicVideoStoryTemplate.displayName = 'MusicVideoStoryTemplate';

// Export metadata
export const metadata = {
  id: "general-music-video-story-01",
  name: "Music Video Story",
  description: "A beautiful card combining music, video, and your personal message",
  category: "general",
  folder: "general",
  componentPath: "general/MusicVideoStory",
  tags: ["music", "video", "song", "story", "modern", "vibrant"],
  supports: {
    message: true,
    image: false,
    voice: false,
    music: true,
    video: true,
  },
  style: "modern",
  colorScheme: ["#a855f7", "#60a5fa", "#ec4899"],
  mood: ["energetic", "celebratory", "romantic", "fun"],
  thumbnail: "/templates/music-video-story-thumb.jpg",
  aspectRatio: "3:4",
  isPremium: false,
  isActive: true,
  isFeatured: true,
  isNew: true,
  isTrending: false,
  views: 0,
  uses: 0,
  rating: 0,
  ratingCount: 0,
  createdBy: "system",
  version: "1.0.0",
};
