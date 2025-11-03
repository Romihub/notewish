import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Mic } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function MixedMediaCard() {
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [musicProgress, setMusicProgress] = useState(0);

  // Simulate voice playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVoicePlaying) {
      interval = setInterval(() => {
        setVoiceProgress((prev) => {
          if (prev >= 100) {
            setIsVoicePlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isVoicePlaying]);

  // Simulate music playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMusicPlaying) {
      interval = setInterval(() => {
        setMusicProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 0.3;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isMusicPlaying]);

  const quotes = [
    "Wishing you a day",
    "filled with love,",
    "laughter, and",
    "endless joy.",
    "Happy Birthday! 🎂"
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background layer - soft focus image with video loop effect */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1747549433224-bf5b91c6bb00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwZm9jdXMlMjBib2tlaCUyMHBhc3RlbHxlbnwxfHx8fDE3NjA3MzYzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Soft focus background"
          className="w-full h-full object-cover"
        />
        
        {/* Animated overlay to simulate video loop */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blur and vignette overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40" style={{
          boxShadow: 'inset 0 0 200px rgba(0,0,0,0.6)'
        }} />

        {/* Animated light particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                filter: 'blur(1px)'
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>
      </div>

      {/* Foreground content layer */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        
        {/* Play Voice bubble - top section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-20 left-1/2 -translate-x-1/2"
        >
          <motion.button
            onClick={() => setIsVoicePlaying(!isVoicePlaying)}
            className="relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-500/40 blur-xl"
              animate={{
                scale: isVoicePlaying ? [1, 1.3, 1] : 1,
                opacity: isVoicePlaying ? [0.4, 0.6, 0.4] : 0.4
              }}
              transition={{
                duration: 2,
                repeat: isVoicePlaying ? Infinity : 0
              }}
            />
            <div className="relative bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl flex items-center gap-3 border border-white/40">
              <motion.div
                animate={{
                  scale: isVoicePlaying ? [1, 1.2, 1] : 1
                }}
                transition={{
                  duration: 1,
                  repeat: isVoicePlaying ? Infinity : 0
                }}
              >
                <Mic className={`w-5 h-5 ${isVoicePlaying ? 'text-purple-600' : 'text-gray-700'}`} />
              </motion.div>
              <span className="text-gray-900">
                {isVoicePlaying ? 'Playing Voice...' : 'Play Voice Message'}
              </span>
              {isVoicePlaying && (
                <motion.div
                  className="flex gap-0.5 items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-purple-600 rounded-full"
                      animate={{
                        height: ['8px', '16px', '8px']
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.button>

          {/* Voice progress indicator */}
          <AnimatePresence>
            {isVoicePlaying && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full"
              >
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    style={{ width: `${voiceProgress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Animated text/quote - center section */}
        <div className="text-center space-y-6 max-w-3xl">
          {quotes.map((quote, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ 
                opacity: 1, 
                y: 0,
                filter: 'blur(0px)'
              }}
              transition={{
                delay: 0.5 + index * 0.2,
                duration: 1,
                ease: [0.23, 1, 0.32, 1]
              }}
            >
              <motion.h1
                className="text-white"
                style={{
                  textShadow: '0 0 40px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)',
                  fontFamily: 'Georgia, serif',
                  fontStyle: index === quotes.length - 1 ? 'normal' : 'italic'
                }}
                animate={{
                  opacity: [1, 0.9, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5
                }}
              >
                {quote}
              </motion.h1>
            </motion.div>
          ))}

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-2 h-2 border border-white/60 rotate-45"
            />
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </motion.div>
        </div>

        {/* Floating music bar - bottom right */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="absolute bottom-8 right-8"
        >
          <motion.div
            className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10 min-w-[280px]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                {isMusicPlaying ? (
                  <Pause className="w-4 h-4 text-white" fill="white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                )}
              </button>

              <div className="flex-1">
                <p className="text-white/90">Ambient Melody</p>
                <p className="text-white/50">Background Music</p>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white/80" />
                )}
              </button>
            </div>

            {/* Music progress bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-full"
                style={{ width: `${musicProgress}%` }}
              />
            </div>

            {/* Animated equalizer bars */}
            <div className="flex gap-1 items-end h-8 mt-3 justify-center">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-violet-500 to-purple-400 rounded-full"
                  animate={{
                    height: isMusicPlaying 
                      ? ['30%', `${50 + Math.random() * 50}%`, '30%']
                      : '30%'
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: isMusicPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Subtle signature/sender info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-8 text-white/60"
        >
          <p>With love,</p>
          <p>Your Friends & Family ❤️</p>
        </motion.div>
      </div>

      {/* Cinematic lens flare effect */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
