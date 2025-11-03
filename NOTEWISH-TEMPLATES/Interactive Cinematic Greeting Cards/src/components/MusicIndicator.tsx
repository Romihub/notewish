import { motion } from "motion/react";
import { Volume2 } from "lucide-react";

export function MusicIndicator({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
      <Volume2 className="w-4 h-4 text-white/90" />
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-white/90 rounded-full"
            animate={
              isPlaying
                ? {
                    height: ["4px", "16px", "4px"],
                  }
                : { height: "4px" }
            }
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              repeat: isPlaying ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
