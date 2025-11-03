import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ClassicFoldCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleCard = () => setIsOpen(!isOpen);
  const toggleMusic = () => setIsPlaying(!isPlaying);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
      {/* Ambient sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        ))}
      </div>

      {/* Card container */}
      <div className="relative" style={{ perspective: '2000px' }}>
        <motion.div
          className="relative w-[800px] h-[600px] cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          onClick={toggleCard}
        >
          {/* Front Cover */}
          <motion.div
            className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d'
            }}
            animate={{
              rotateY: isOpen ? -180 : 0
            }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 p-8">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1650923780562-07c034e3b0d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwc3BhcmtsZXN8ZW58MXx8fHwxNzYwNzM1ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Celebration"
                className="w-full h-full object-cover rounded-2xl opacity-80"
              />
              
              {/* Cover content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-center space-y-6"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-12 h-12 text-yellow-300" />
                    <h1 className="text-white drop-shadow-lg">Happy Birthday!</h1>
                    <Sparkles className="w-12 h-12 text-yellow-300" />
                  </div>
                  
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-white/80 text-center"
                  >
                    ✨ Tap to open ✨
                  </motion.div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-8 left-8 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute bottom-8 right-8 w-40 h-40 bg-purple-300/30 rounded-full blur-3xl" />
            </div>
          </motion.div>

          {/* Inside Card */}
          <motion.div
            className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
              rotateY: 180
            }}
            animate={{
              rotateY: isOpen ? 0 : 180
            }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-amber-50 via-white to-rose-50">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }} />
              </div>

              {/* Inside content */}
              <div className="relative h-full flex flex-col items-center justify-center p-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-center space-y-8 max-w-xl"
                >
                  <div className="space-y-4">
                    <p className="text-purple-600/80">
                      On your special day, may all your dreams come true and your heart be filled with joy.
                    </p>
                    <p className="text-gray-700">
                      Here's to another year of laughter, love, and unforgettable moments. 
                      You deserve all the happiness in the world!
                    </p>
                    <p className="text-purple-600/80">
                      Wishing you the most wonderful birthday celebration! 🎉
                    </p>
                  </div>

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-pink-500"
                  >
                    With love & best wishes ❤️
                  </motion.div>
                </motion.div>

                {/* Music controls */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-80"
                    >
                      <div className="bg-white/80 backdrop-blur-lg rounded-full px-6 py-4 shadow-lg flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMusic();
                          }}
                          className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" fill="white" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                          )}
                        </button>
                        
                        <div className="flex-1 mx-4">
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              initial={{ width: '0%' }}
                              animate={{ width: isPlaying ? '100%' : '0%' }}
                              transition={{ duration: 30, ease: 'linear' }}
                            />
                          </div>
                          <p className="text-gray-600 mt-1">Birthday Song</p>
                        </div>

                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {isPlaying ? (
                            <Volume2 className="w-5 h-5" />
                          ) : (
                            <VolumeX className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-32 h-32">
                <div className="absolute top-4 left-4 w-20 h-0.5 bg-gradient-to-r from-purple-300 to-transparent" />
                <div className="absolute top-4 left-4 w-0.5 h-20 bg-gradient-to-b from-purple-300 to-transparent" />
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32">
                <div className="absolute bottom-4 right-4 w-20 h-0.5 bg-gradient-to-l from-pink-300 to-transparent" />
                <div className="absolute bottom-4 right-4 w-0.5 h-20 bg-gradient-to-t from-pink-300 to-transparent" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Shadow effect */}
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[700px] h-8 bg-black/20 rounded-full blur-2xl"
          animate={{
            scale: isOpen ? 0.8 : 1,
            opacity: isOpen ? 0.3 : 0.2
          }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
}
