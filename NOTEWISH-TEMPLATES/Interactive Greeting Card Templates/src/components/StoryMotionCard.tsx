import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function StoryMotionCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const messages = [
    "To someone special...",
    "May your day be filled",
    "with love, laughter,",
    "and endless joy",
    "Happy Birthday! 🎉"
  ];

  const handlePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Simulate progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 1;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
        }
      }, 150);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background video simulation with overlay image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1733416340329-e26803e1f194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBjZWxlYnJhdGlvbiUyMGxpZ2h0c3xlbnwxfHx8fDE3NjA3MzU4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Cinematic background"
          className="w-full h-full object-cover"
        />
        
        {/* Animated video effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-black/60"
          animate={{
            opacity: isPlaying ? [0.4, 0.6, 0.4] : 0.4
          }}
          transition={{
            duration: 3,
            repeat: isPlaying ? Infinity : 0
          }}
        />

        {/* Subtle animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: isPlaying ? [0, 0.6, 0] : 0,
                scale: isPlaying ? [0, 1.5, 0] : 0,
                y: isPlaying ? [0, -50] : 0
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: isPlaying ? Infinity : 0,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      {/* Story content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {!isPlaying ? (
            /* Initial play button */
            <motion.div
              key="play-button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <motion.button
                onClick={handlePlay}
                className="relative w-24 h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.2, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
                <Play className="w-10 h-10 text-purple-600 ml-1 relative z-10" fill="currentColor" />
              </motion.button>
              
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white/90 text-center"
              >
                Tap to start your story
              </motion.p>
            </motion.div>
          ) : (
            /* Animated story messages */
            <motion.div
              key="story-content"
              className="text-center space-y-4 max-w-md"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{
                    opacity: progress > index * 20 ? 1 : 0,
                    y: progress > index * 20 ? 0 : 20,
                    scale: progress > index * 20 ? 1 : 0.95
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                  className="relative"
                >
                  <motion.h2
                    className="text-white drop-shadow-2xl"
                    style={{
                      textShadow: '0 0 40px rgba(0,0,0,0.5)'
                    }}
                    animate={
                      progress > index * 20 && progress < (index + 1) * 20
                        ? { scale: [1, 1.05, 1] }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {message}
                  </motion.h2>
                  
                  {/* Glowing underline effect for emphasis */}
                  {index === messages.length - 1 && progress > index * 20 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full mt-4"
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator (top) */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}

        {/* Music overlay bar (bottom) */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md"
        >
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between gap-4">
              {/* Play/Pause control */}
              <button
                onClick={handlePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" fill="white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                )}
              </button>

              {/* Song info and progress */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white/90">Celebration Theme</p>
                  <p className="text-white/60">
                    {Math.floor(progress / 100 * 15)}:{String(Math.floor((progress / 100 * 15 * 60) % 60)).padStart(2, '0')} / 15:00
                  </p>
                </div>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-full"
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Volume control */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white/80" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white/80" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cinematic vignette effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)'
        }} />
      </div>
    </div>
  );
}
