import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageIndicator } from "./PageIndicator";
import { MusicIndicator } from "./MusicIndicator";
import { VideoPlayer } from "./VideoPlayer";
import { VoiceWaveform } from "./VoiceWaveform";
import { ChevronDown } from "lucide-react";

interface FlipbookCardProps {
  coverImage: string;
  title: string;
  messageText: string;
  videoThumbnail: string;
}

export function FlipbookCard({
  coverImage,
  title,
  messageText,
  videoThumbnail,
}: FlipbookCardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const totalPages = 4;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setShowHint(false);
    }
  };

  const pageVariants = {
    initial: { rotateX: 0, zIndex: totalPages },
    flipped: {
      rotateX: -180,
      zIndex: 0,
      transition: {
        duration: 0.9,
        ease: [0.34, 1.56, 0.64, 1], // Elastic ease
      },
    },
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background with soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-lavender-100 via-pink-50 to-blue-50">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(216, 180, 254, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251, 207, 232, 0.3) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Floating ambient particles */}
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
            {/* Page 4 - Voice Message */}
            <motion.div
              className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "bottom",
                zIndex: currentPage >= 3 ? totalPages : totalPages - 3,
              }}
              variants={pageVariants}
              initial="initial"
              animate={currentPage >= 3 ? "flipped" : "initial"}
              onClick={currentPage === 3 ? undefined : handleNextPage}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-white p-8 flex flex-col justify-center">
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentPage === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <h3
                    className="text-center mb-8 text-gray-700"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    A Message For You
                  </h3>
                  <VoiceWaveform duration="0:24" sender="Forever yours" />
                </motion.div>

                {/* Decorative elements */}
                <div className="absolute top-6 right-6 text-4xl opacity-20">💌</div>
                <div className="absolute bottom-6 left-6 text-3xl opacity-20">✨</div>
              </div>
            </motion.div>

            {/* Page 3 - Video */}
            <motion.div
              className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "bottom",
                zIndex: currentPage >= 2 ? totalPages - 1 : totalPages - 2,
              }}
              variants={pageVariants}
              initial="initial"
              animate={currentPage >= 2 ? "flipped" : "initial"}
              onClick={currentPage === 2 ? handleNextPage : currentPage < 2 ? handleNextPage : undefined}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8 flex flex-col justify-center">
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={currentPage === 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <h3
                    className="text-center mb-6 text-gray-700"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Our Beautiful Moment
                  </h3>
                  <VideoPlayer
                    thumbnail={videoThumbnail}
                    title="Watch our story unfold"
                  />
                </motion.div>

                {/* Decorative sparkles */}
                {currentPage === 2 && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-yellow-300/60"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${10 + Math.random() * 80}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: 0.8 + i * 0.15,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </motion.div>

            {/* Page 2 - Text + Music */}
            <motion.div
              className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "bottom",
                zIndex: currentPage >= 1 ? totalPages - 2 : totalPages - 1,
              }}
              variants={pageVariants}
              initial="initial"
              animate={currentPage >= 1 ? "flipped" : "initial"}
              onClick={currentPage === 1 ? handleNextPage : currentPage < 1 ? handleNextPage : undefined}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-white p-10 flex flex-col justify-between">
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentPage === 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <p
                    className="text-center text-gray-700 leading-relaxed italic px-4"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {messageText}
                  </p>
                </motion.div>

                {/* Music indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={currentPage === 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="flex justify-center"
                >
                  <MusicIndicator isPlaying={currentPage === 1} />
                </motion.div>

                {/* Decorative border */}
                <div className="absolute inset-6 border border-purple-200/50 rounded-2xl pointer-events-none" />
              </div>
            </motion.div>

            {/* Page 1 - Cover (Image + Title) */}
            <motion.div
              className="absolute inset-0 rounded-3xl shadow-2xl cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "bottom",
                zIndex: currentPage >= 0 ? totalPages - 3 : totalPages,
              }}
              variants={pageVariants}
              initial="initial"
              animate={currentPage >= 1 ? "flipped" : "initial"}
              onClick={currentPage === 0 ? handleNextPage : undefined}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden relative">
                {/* Cover image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${coverImage})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

                {/* Title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-center"
                  >
                    <h1
                      className="text-white drop-shadow-2xl text-5xl leading-tight mb-4"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {title}
                    </h1>
                    <div className="w-24 h-1 bg-white/50 mx-auto rounded-full" />
                  </motion.div>
                </div>

                {/* Swipe hint */}
                <AnimatePresence>
                  {showHint && currentPage === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 1.5, duration: 0.6 }}
                      className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                      <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-lg flex items-center gap-2">
                        <motion.span
                          className="text-sm"
                          style={{ fontFamily: "var(--font-dm-sans)" }}
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Tap to flip
                        </motion.span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Decorative frame */}
                <div className="absolute inset-6 border-2 border-white/30 rounded-2xl pointer-events-none" />
              </div>
            </motion.div>
          </div>

          {/* Page indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -bottom-20 left-1/2 -translate-x-1/2"
          >
            <PageIndicator currentPage={currentPage} totalPages={totalPages} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
