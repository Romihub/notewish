import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Mic } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function VoiceMessageCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate random waveform data
  useEffect(() => {
    const data = Array.from({ length: 40 }, () => Math.random() * 0.7 + 0.3);
    setWaveformData(data);
  }, []);

  // Simulate audio playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (percent: number) => {
    const totalSeconds = Math.floor((percent / 100) * 45); // 45 second message
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-100 via-pink-50 to-blue-100">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-blue-300/40 to-violet-300/40 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main card content */}
      <div className="relative z-10 w-full max-w-2xl px-8">
        {/* Sender portrait */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/60 shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758467797696-17cbb1098bcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHNtaWxlJTIwZ2VudGxlfGVufDF8fHx8MTc2MDczNjMxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Sender"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full ring-2 ring-white" />
          </div>
          <div>
            <p className="text-gray-900">Sarah Johnson</p>
            <p className="text-gray-500">sent you a voice message</p>
          </div>
        </motion.div>

        {/* Voice playback bubble */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="relative"
        >
          <motion.div
            className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl overflow-hidden"
            animate={{
              boxShadow: isPlaying 
                ? '0 0 0 4px rgba(168, 85, 247, 0.4), 0 20px 60px rgba(0, 0, 0, 0.15)'
                : '0 20px 60px rgba(0, 0, 0, 0.1)'
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Glowing border when playing */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)',
                    backgroundSize: '200% 100%'
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{
                      backgroundPosition: ['0% 50%', '200% 50%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), transparent)',
                      backgroundSize: '200% 100%'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 flex items-center gap-6">
              {/* Play/Pause button */}
              <motion.button
                onClick={togglePlay}
                className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Pause className="w-7 h-7 text-white" fill="white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Play className="w-7 h-7 text-white ml-1" fill="white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Waveform visualization */}
              <div className="flex-1 flex items-center gap-1 h-20">
                {waveformData.map((height, index) => {
                  const isActive = (progress / 100) * waveformData.length > index;
                  return (
                    <motion.div
                      key={index}
                      className="flex-1 rounded-full"
                      style={{
                        background: isActive
                          ? 'linear-gradient(to top, #a855f7, #ec4899)'
                          : '#e5e7eb'
                      }}
                      initial={{ height: '20%' }}
                      animate={{
                        height: isPlaying && isActive
                          ? `${height * 100}%`
                          : `${height * 60}%`,
                        scale: isPlaying && isActive ? [1, 1.2, 1] : 1
                      }}
                      transition={{
                        height: { duration: 0.2 },
                        scale: {
                          duration: 0.3,
                          repeat: isPlaying && isActive ? Infinity : 0,
                          repeatDelay: 0.1
                        }
                      }}
                    />
                  );
                })}
              </div>

              {/* Time display */}
              <div className="flex-shrink-0 text-gray-600 min-w-[4rem] text-right">
                {formatTime(progress)} / 0:45
              </div>
            </div>

            {/* Mic icon indicator */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{
                scale: isPlaying ? [1, 1.2, 1] : 1,
                opacity: isPlaying ? [0.5, 1, 0.5] : 0.3
              }}
              transition={{
                duration: 1.5,
                repeat: isPlaying ? Infinity : 0
              }}
            >
              <Mic className="w-5 h-5 text-purple-400" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Text message area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <p className="text-gray-700 leading-relaxed">
            "Hey! I wanted to send you a personal birthday message. 
            I hope this year brings you all the joy and success you deserve. 
            Can't wait to celebrate with you soon! 🎉"
          </p>
          <div className="mt-4 flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <p>Received today at 2:34 PM</p>
          </div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -60],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
