import { motion } from "motion/react";
import { Play, Pause } from "lucide-react";
import { useState } from "react";

interface VoiceWaveformProps {
  duration?: string;
  sender?: string;
}

export function VoiceWaveform({ duration = "0:24", sender = "With love" }: VoiceWaveformProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const bars = [
    8, 15, 12, 20, 18, 25, 22, 28, 24, 30, 26, 32, 28, 30, 25, 20, 15, 18, 22, 16,
    12, 14, 18, 20, 24, 22, 18, 15, 12, 10
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-xl">
        {/* Waveform visualization */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </button>

          <div className="flex-1 flex items-center gap-0.5 h-16">
            {bars.map((height, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full"
                style={{ height: `${height}%` }}
                animate={
                  isPlaying
                    ? {
                        scaleY: [1, 1.3, 0.8, 1.2, 1],
                      }
                    : { scaleY: 1 }
                }
                transition={{
                  duration: 0.8,
                  delay: i * 0.02,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="text-sm text-gray-600" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {duration}
          </div>
        </div>

        {/* Sender signature */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center">
              <span className="text-sm text-white">💝</span>
            </div>
            <p
              className="text-gray-700 italic"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {sender}
            </p>
          </div>
          
          {/* Ambient pulse indicator */}
          {isPlaying && (
            <motion.div
              className="flex gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-pink-400"
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
