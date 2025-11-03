import { motion } from "motion/react";
import { Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  thumbnail: string;
  title?: string;
}

export function VideoPlayer({ thumbnail, title = "A Special Memory" }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
        {/* Video thumbnail */}
        <div
          className="aspect-video bg-cover bg-center"
          style={{
            backgroundImage: `url(${thumbnail})`,
          }}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Play button overlay */}
          {!isPlaying && (
            <motion.button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(255, 255, 255, 0.4)",
                    "0 0 0 20px rgba(255, 255, 255, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="w-8 h-8 text-purple-500 fill-purple-500 ml-1" />
              </motion.div>
            </motion.button>
          )}

          {/* Video playing state */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-white/80">
                {/* Simulated video playback */}
                <motion.div
                  className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white drop-shadow-lg"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {title}
            </motion.p>
          </div>
        </div>

        {/* Glassmorphic border */}
        <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none" />
      </div>
    </div>
  );
}
