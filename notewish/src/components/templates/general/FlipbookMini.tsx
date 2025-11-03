"use client";

import { useState, useEffect, useImperativeHandle } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { TemplateProps, TemplateRenderer } from "@/types/template";
import { PageIndicator } from "@/components/ui/PageIndicator";
import { SongPlayer } from "@/components/ui/SongPlayer";

export default function FlipbookMiniTemplate({
  cardId,
  occasion,
  messageVariations,
  imageUrl,
  musicUrl,
  songUrl,
  songTitle,
  recipientName,
  greetings,
  personalMessage,
  mode = "view",
  renderer
}: TemplateProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  
  // Use ONLY the user's final saved message (first item in array)
  // MessageGenerator saves only ONE message that the user selected/edited
  const userMessage = messageVariations && messageVariations.length > 0 ? messageVariations[0] : null;
  const totalPages = 1 + (userMessage ? 1 : 0) + (imageUrl ? 1 : 0) + (songUrl ? 1 : 0);

  // Connect to the renderer if it's provided (for video generation)
  useEffect(() => {
    if (renderer) {
      renderer.setPage = setCurrentPage;
      renderer.getTotalPages = () => totalPages;
    }
  }, [renderer, totalPages]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setShowHint(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Swipe detection
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      // Swiped right = go back
      handlePrevPage();
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left = go forward
      handleNextPage();
    }
  };

  // Modern smooth page turn animation
  const pageVariants = {
    initial: { 
      rotateY: 0,
      scale: 1,
      opacity: 1,
    },
    flipped: { 
      rotateY: -180,
      scale: 0.95,
      opacity: 0,
    },
  };
  
  const pageTransition = {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94] as const, // Smooth, modern easing
  };

  return (
    <div className="relative w-full h-screen flex items-start justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(216, 180, 254, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 207, 232, 0.3) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background:
                i % 3 === 0
                  ? "rgba(216, 180, 254, 0.4)"
                  : i % 3 === 1
                  ? "rgba(251, 207, 232, 0.4)"
                  : "rgba(165, 243, 252, 0.4)",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Flipbook Container */}
      <div className="relative z-10">
        <div
          className="relative"
          style={{
            width: "420px",
            height: "600px",
            perspective: "2000px",
          }}
        >
          {/* Page stack container */}
          <div
            className="relative w-full h-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Song Player Page */}
            {songUrl && (
              <motion.div
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center",
                  zIndex: currentPage > ((userMessage ? 1 : 0) + (imageUrl ? 1 : 0)) ? 0 : totalPages - (userMessage ? 1 : 0) - (imageUrl ? 1 : 0) - 1,
                }}
                variants={pageVariants}
                initial="initial"
                animate={currentPage > ((userMessage ? 1 : 0) + (imageUrl ? 1 : 0)) ? "flipped" : "initial"}
                transition={pageTransition}
                onClick={handleNextPage}
              >
                <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-10 flex flex-col items-center justify-center">
                  <SongPlayer 
                    src={songUrl} 
                    title={songTitle || "Your Special Song"} 
                    artist="NoteWish"
                  />
                  <div className="absolute inset-6 border border-purple-200/50 rounded-2xl pointer-events-none" />
                </div>
              </motion.div>
            )}

            {/* Image Page */}
            {imageUrl && (
              <motion.div
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center",
                  zIndex: currentPage > (userMessage ? 1 : 0) ? 0 : totalPages - (userMessage ? 1 : 0) - 1,
                }}
                variants={pageVariants}
                initial="initial"
                animate={currentPage > (userMessage ? 1 : 0) ? "flipped" : "initial"}
                transition={pageTransition}
                onClick={handleNextPage}
              >
                <div className="w-full h-full rounded-3xl overflow-hidden relative bg-gradient-to-br from-gray-100 via-white to-gray-100">
                  <img 
                    src={imageUrl}
                    alt="Generated artwork"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                  />
                  <div className="absolute inset-6 border-2 border-white/50 rounded-2xl pointer-events-none" />
                </div>
              </motion.div>
            )}

            {/* Message Page - User's Final Message Only */}
            {userMessage && (
              <motion.div
                className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center",
                  zIndex: currentPage > 1 ? 0 : totalPages - 1,
                  pointerEvents: currentPage === 1 ? "auto" : "none"
                }}
                variants={pageVariants}
                initial="initial"
                animate={currentPage > 1 ? "flipped" : "initial"}
                transition={pageTransition}
                onClick={handleNextPage}
              >
                <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-white p-10 flex flex-col justify-center relative">
                  {/* Decorative quote marks */}
                  <div className="absolute top-8 left-8 text-6xl text-purple-200 font-serif leading-none">"</div>
                  <div className="absolute bottom-8 right-8 text-6xl text-purple-200 font-serif leading-none">"</div>
                  
                  <p className="text-center text-gray-700 leading-relaxed italic px-8 text-lg font-[family-name:var(--font-playfair)] z-10">
                    {userMessage}
                  </p>
                  <div className="absolute inset-6 border border-purple-200/50 rounded-2xl pointer-events-none" />
                </div>
              </motion.div>
            )}

            {/* Cover Page */}
            <motion.div
              className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                zIndex: currentPage >= 1 ? 0 : totalPages,
              }}
              variants={pageVariants}
              initial="initial"
              animate={currentPage >= 1 ? "flipped" : "initial"}
              transition={pageTransition}
              onClick={handleNextPage}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden relative bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <h1 className="text-white drop-shadow-2xl text-5xl leading-tight mb-4 font-[family-name:var(--font-playfair)] text-center">
                    {greetings || `Happy ${occasion}!`}
                  </h1>
                  {recipientName && (
                    <p className="text-white/90 text-2xl font-light">
                      For {recipientName}
                    </p>
                  )}
                  <div className="w-24 h-1 bg-white/50 mx-auto rounded-full mt-4" />
                  {personalMessage && (
                    <p className="text-white/80 text-sm mt-4 italic max-w-md text-center">
                      "{personalMessage}"
                    </p>
                  )}
                </div>
                
                {/* Occasion watermark at bottom */}
                {occasion && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <p className="text-white/40 text-[10px] font-light tracking-wider font-[family-name:var(--font-inter)]">
                      {occasion}
                    </p>
                  </div>
                )}
                
                <AnimatePresence>
                  {showHint && currentPage === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                      <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-lg flex items-center gap-2">
                        <span className="text-sm">Tap to flip</span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="absolute inset-6 border-2 border-white/30 rounded-2xl pointer-events-none" />
              </div>
            </motion.div>
          </div>

          {/* Page indicator */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2">
            <PageIndicator currentPage={currentPage} totalPages={totalPages} />
          </div>
        </div>
      </div>

      {/* Modern Navigation - BIGGER Clickable dots */}
      {totalPages > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/90 backdrop-blur-md border border-white/50 shadow-lg">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  currentPage === idx
                    ? 'w-12 h-4 bg-purple-600'
                    : 'w-4 h-4 bg-gray-400 hover:bg-purple-400'
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
  id: "general-flipbook-mini-01",
  name: "Flipbook Mini",
  description: "Interactive flipbook card with message variations and music player",
  category: "general",
  folder: "general",
  componentPath: "general/FlipbookMini",
  tags: ["modern", "interactive", "animated", "playful", "vibrant"],
  supports: {
    message: true,
    image: true,
    voice: false,
    music: true,
    video: false,
  },
  style: "modern",
  colorScheme: ["#a78bfa", "#f9a8d4", "#93c5fd"],
  mood: ["happy", "celebratory", "fun"],
  thumbnail: "/templates/flipbook-mini-thumb.jpg",
  aspectRatio: "16:9",
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
