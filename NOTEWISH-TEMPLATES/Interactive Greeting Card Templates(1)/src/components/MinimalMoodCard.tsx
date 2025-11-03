import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Pause } from 'lucide-react';

export function MinimalMoodCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicPosition, setMusicPosition] = useState({ x: 0, y: 0 });

  // Randomize music icon position on mount
  useEffect(() => {
    setMusicPosition({
      x: Math.random() * 60 - 30, // -30 to 30
      y: Math.random() * 60 - 30
    });
  }, []);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      animate={{
        background: isPlaying
          ? [
              'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              'linear-gradient(135deg, #f093fb 0%, #667eea 50%, #764ba2 100%)',
              'linear-gradient(135deg, #764ba2 0%, #f093fb 50%, #667eea 100%)',
              'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            ]
          : [
              'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ffecd2 100%)',
              'linear-gradient(135deg, #fcb69f 0%, #ffecd2 50%, #ff9a9e 100%)',
              'linear-gradient(135deg, #ff9a9e 0%, #ffecd2 50%, #fcb69f 100%)',
              'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ffecd2 100%)',
            ]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Ambient light orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-40 blur-3xl"
        animate={{
          background: isPlaying
            ? [
                'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
              ]
            : [
                'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(255,200,200,0.3) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
              ],
          x: [0, 100, -50, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.3, 0.9, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-40 blur-3xl"
        animate={{
          background: isPlaying
            ? [
                'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
              ]
            : [
                'radial-gradient(circle, rgba(252,182,159,0.4) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(252,182,159,0.4) 0%, transparent 70%)',
              ],
          x: [0, -100, 50, 0],
          y: [0, 80, -50, 0],
          scale: [1, 0.9, 1.2, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-8 max-w-4xl">
        {/* Minimal text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <motion.h1
            className="text-white"
            style={{
              textShadow: '0 10px 30px rgba(0,0,0,0.2)',
              letterSpacing: '0.02em'
            }}
            animate={{
              opacity: [1, 0.95, 1],
              scale: [1, 1.01, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            You mean the world to me ❤️
          </motion.h1>
        </motion.div>

        {/* Subtle decorative elements */}
        <motion.div
          className="absolute -left-20 top-1/2 -translate-y-1/2"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            x: [-10, 10, -10]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-1 h-32 bg-white/30 rounded-full" />
        </motion.div>

        <motion.div
          className="absolute -right-20 top-1/2 -translate-y-1/2"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            x: [10, -10, 10]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        >
          <div className="w-1 h-32 bg-white/30 rounded-full" />
        </motion.div>
      </div>

      {/* Floating music icon */}
      <motion.div
        className="absolute"
        style={{
          left: `calc(50% + ${musicPosition.x}vw)`,
          top: `calc(50% + ${musicPosition.y}vh)`,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: [0, -15, 0]
        }}
        transition={{
          opacity: { delay: 1, duration: 1 },
          scale: { delay: 1, duration: 0.5, type: "spring" },
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <motion.button
          onClick={toggleMusic}
          className="relative group"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            animate={{
              background: isPlaying
                ? [
                    'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(236,72,153,0.6) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
                  ]
                : 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
              scale: isPlaying ? [1, 1.5, 1] : 1
            }}
            transition={{
              duration: 2,
              repeat: isPlaying ? Infinity : 0,
              ease: "easeInOut"
            }}
          />

          {/* Ripple effect when playing */}
          <AnimatePresence>
            {isPlaying && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-white/40"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ 
                      scale: 2.5, 
                      opacity: 0 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Icon container */}
          <motion.div
            className="relative w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl"
            animate={{
              boxShadow: isPlaying
                ? [
                    '0 0 20px rgba(139,92,246,0.4), 0 10px 40px rgba(0,0,0,0.2)',
                    '0 0 30px rgba(236,72,153,0.5), 0 10px 40px rgba(0,0,0,0.2)',
                    '0 0 20px rgba(139,92,246,0.4), 0 10px 40px rgba(0,0,0,0.2)',
                  ]
                : '0 10px 40px rgba(0,0,0,0.15)'
            }}
            transition={{
              duration: 2,
              repeat: isPlaying ? Infinity : 0
            }}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Pause className="w-7 h-7 text-purple-600" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  key="music"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0
                  }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Music className="w-7 h-7 text-pink-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Floating musical notes when playing */}
          <AnimatePresence>
            {isPlaying && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-white/60"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 1],
                      x: Math.cos((i * 360 / 5) * Math.PI / 180) * 60,
                      y: Math.sin((i * 360 / 5) * Math.PI / 180) * 60 - 30,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                  >
                    ♪
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, -80],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0.5]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Breathing light effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isPlaying
            ? [
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              ]
            : [
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              ]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
