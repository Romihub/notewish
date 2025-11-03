"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { TemplateProps } from "@/types/template";
import { SongPlayer } from "@/components/ui/SongPlayer";

export default function CinematicStoryTemplate({
  cardId,
  occasion,
  messageVariations,
  imageUrl,
  videoUrl,
  songUrl,
  songTitle,
  recipientName,
  greetings,
  personalMessage,
  mode = "view"
}: TemplateProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Use ONLY the user's final saved message
  const userMessage = messageVariations && messageVariations.length > 0 ? messageVariations[0] : null;
  const totalPages = 1 + (videoUrl ? 1 : 0) + (userMessage ? 1 : 0) + (songUrl ? 1 : 0);

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
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Forest Luxe Background - emerald green gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Golden floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-300/40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Card Container */}
      <div className="relative z-10">
        <div
          className="relative"
          style={{
            width: "480px",
            height: "640px",
          }}
        >
          <AnimatePresence mode="wait">
            {/* Cover Page */}
            {currentPage === 0 && (
              <motion.div
                key="cover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer overflow-hidden"
                onClick={handleNextPage}
              >
                <div className="w-full h-full relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-700">
                  {/* Decorative gold accent overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-900/20" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <h1 className="text-cream-50 drop-shadow-2xl text-6xl leading-tight mb-6 font-[family-name:var(--font-playfair)] text-center">
                        {greetings || `Happy ${occasion}!`}
                      </h1>
                    </motion.div>
                    
                    {recipientName && (
                      <p className="text-amber-100 text-3xl font-light">
                        For {recipientName}
                      </p>
                    )}
                    
                    <div className="w-32 h-1 bg-amber-400/60 mx-auto rounded-full mt-6" />
                    
                    {personalMessage && (
                      <p className="text-cream-100 text-base mt-6 italic max-w-md text-center">
                        "{personalMessage}"
                      </p>
                    )}
                  </div>

                  {/* Golden border */}
                  <div className="absolute inset-6 border-2 border-amber-400/40 rounded-2xl pointer-events-none" />
                  
                  {/* Tap hint */}
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                      >
                        <div className="px-5 py-2.5 rounded-full bg-cream-50/90 backdrop-blur-md border border-amber-300/50 shadow-lg">
                          <span className="text-sm text-emerald-900">Tap to continue</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Video Page */}
            {videoUrl && currentPage === 1 && (
              <motion.div
                key="video"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer overflow-hidden"
                onClick={handleNextPage}
              >
                <div className="w-full h-full relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-black">
                  {/* Video player */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl relative">
                      {/* Video thumbnail/player */}
                      <div className="absolute inset-0 bg-black">
                        {!isVideoPlaying && imageUrl && (
                          <img 
                            src={imageUrl}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Play button overlay */}
                        {!isVideoPlaying && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsVideoPlaying(true);
                            }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <motion.div
                              className="w-20 h-20 rounded-full bg-cream-50/95 backdrop-blur-sm flex items-center justify-center shadow-xl"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              animate={{
                                boxShadow: [
                                  "0 0 0 0 rgba(251, 191, 36, 0.4)",
                                  "0 0 0 20px rgba(251, 191, 36, 0)",
                                ],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Play className="w-8 h-8 text-emerald-700 fill-emerald-700 ml-1" />
                            </motion.div>
                          </button>
                        )}
                      </div>
                      
                      {/* Golden border */}
                      <div className="absolute inset-0 border-2 border-amber-400/30 rounded-2xl pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Message Page */}
            {userMessage && currentPage === (videoUrl ? 2 : 1) && (
              <motion.div
                key="message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer overflow-hidden"
                onClick={handleNextPage}
              >
                <div className="w-full h-full relative bg-gradient-to-br from-cream-50 via-amber-50 to-emerald-50 p-12 flex flex-col justify-center">
                  {/* Decorative emerald quote marks */}
                  <div className="absolute top-8 left-8 text-7xl text-emerald-300/60 font-serif leading-none">"</div>
                  <div className="absolute bottom-8 right-8 text-7xl text-emerald-300/60 font-serif leading-none">"</div>
                  
                  <p className="text-center text-emerald-900 leading-relaxed italic px-8 text-xl font-[family-name:var(--font-playfair)] z-10">
                    {userMessage}
                  </p>
                  
                  {/* Golden border */}
                  <div className="absolute inset-6 border border-amber-300/50 rounded-2xl pointer-events-none" />
                </div>
              </motion.div>
            )}

            {/* Music Player Page */}
            {songUrl && currentPage === totalPages - 1 && (
              <motion.div
                key="music"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer overflow-hidden"
                onClick={handleNextPage}
              >
                <div className="w-full h-full relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-amber-800 p-12 flex flex-col items-center justify-center">
                  <SongPlayer 
                    src={songUrl} 
                    title={songTitle || "Your Special Song"} 
                    artist="NoteWish"
                  />
                  
                  {/* Golden border */}
                  <div className="absolute inset-6 border border-amber-400/50 rounded-2xl pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation dots - Forest Luxe colors */}
      {totalPages > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-cream-50/90 backdrop-blur-md border border-amber-300/50 shadow-lg">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  currentPage === idx
                    ? 'w-12 h-4 bg-emerald-700'
                    : 'w-4 h-4 bg-amber-400/60 hover:bg-emerald-500'
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export metadata
export const metadata = {
  id: "general-cinematic-story-01",
  name: "Cinematic Story",
  description: "Elegant cinematic card with video and music support",
  category: "general",
  folder: "general",
  componentPath: "general/CinematicStory",
  tags: ["cinematic", "elegant", "video", "music", "forest", "luxe"],
  supports: {
    message: true,
    image: true,
    voice: false,
    music: true,
    video: true,
  },
  style: "elegant",
  colorScheme: ["#047857", "#d97706", "#fef3c7"],
  mood: ["sophisticated", "warm", "celebratory"],
  thumbnail: "/templates/cinematic-story-thumb.jpg",
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
