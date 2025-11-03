"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface SongPlayerProps {
  src: string;
  title?: string;
  artist?: string;
}

export function SongPlayer({ src, title = "Your Song", artist = "NoteWish" }: SongPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-purple-200/50">
      <audio ref={audioRef} src={src} />
      
      {/* Song Info */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-gray-600 truncate">{artist}</p>
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-center justify-center gap-1 h-12 mb-3">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
            animate={
              isPlaying
                ? {
                    height: [
                      `${20 + Math.random() * 30}%`,
                      `${40 + Math.random() * 60}%`,
                      `${20 + Math.random() * 30}%`,
                    ],
                  }
                : { height: "20%" }
            }
            transition={{
              duration: 0.6 + Math.random() * 0.4,
              repeat: isPlaying ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="relative w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
          <span className="text-xs text-gray-500">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center hover:shadow-lg transition-shadow"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
