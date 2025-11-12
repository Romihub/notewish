"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Rewind } from 'lucide-react';

interface VoicePlayerProps {
  src: string;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full max-w-sm p-6 bg-cream-50/10 backdrop-blur-lg rounded-2xl border border-amber-300/20 shadow-2xl"
      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up to the parent
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center justify-center space-x-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRewind}
          className="text-amber-200/70 hover:text-amber-100"
        >
          <Rewind className="w-8 h-8" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlayPause}
          className="w-20 h-20 rounded-full bg-amber-400/80 flex items-center justify-center text-emerald-900 shadow-lg"
        >
          {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
        </motion.button>

        <div className="w-16 text-center text-amber-200/70 font-mono text-lg">
          {formatTime(duration - progress)}
        </div>
      </div>

      <div className="w-full bg-black/20 rounded-full h-2 mt-6 overflow-hidden">
        <motion.div
          className="bg-amber-400 h-full"
          style={{ width: `${(progress / duration) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default VoicePlayer;
