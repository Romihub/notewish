"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";

// ============================================
// TEMPLATE 1: MESSAGE ONLY (Minimalist)
// ============================================
// Use case: Quick text-based cards, thank you notes
// Assets used: MESSAGE only

export function MinimalistMessageTemplate({ 
  message,
  occasion = "Special Day"
}: {
  message: string;
  occasion?: string;
}) {
  return (
    <div data-template-root="true" className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-200 rounded-full opacity-20 blur-3xl" />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl px-8 text-center"
      >
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-[family-name:var(--font-inter)]"
        >
          {occasion}
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-relaxed font-[family-name:var(--font-poppins)]"
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
}

// ============================================
// TEMPLATE 2: MESSAGE + IMAGE (Classic Card)
// ============================================
// Use case: Birthday cards, greetings with photos
// Assets used: MESSAGE + IMAGE

export function ClassicPhotoCardTemplate({
  message,
  imageUrl,
  occasion = "Happy Birthday"
}: {
  message: string;
  imageUrl: string;
  occasion?: string;
}) {
  return (
    <div data-template-root="true" className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Content Container */}
      <div className="relative max-w-5xl w-full px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={imageUrl} 
                alt="Generated card image"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Decorative frame */}
            <div className="absolute -inset-4 border-2 border-purple-300 rounded-3xl -z-10 opacity-50" />
          </motion.div>
          
          {/* Right: Message */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-2xl font-semibold text-purple-600 mb-6 font-[family-name:var(--font-poppins)]">
              {occasion}
            </p>
            
            <p className="text-3xl md:text-4xl text-gray-800 leading-relaxed font-[family-name:var(--font-inter)]">
              {message}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEMPLATE 3: MESSAGE + IMAGE + MUSIC (Enhanced)
// ============================================
// Use case: Romantic cards, celebrations with background music
// Assets used: MESSAGE + IMAGE + MUSIC

export function RomanticMusicCardTemplate({
  message,
  imageUrl,
  musicUrl,
  occasion = "With Love"
}: {
  message: string;
  imageUrl: string;
  musicUrl: string;
  occasion?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <div data-template-root="true" className="relative w-full h-screen overflow-hidden">
      {/* Background Image (blurred) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 backdrop-blur-xl bg-black/40" />
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-8">
        {/* Main Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-12"
        >
          <div className="w-80 h-80 rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <img 
              src={imageUrl}
              alt="Card image"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
        
        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-3xl text-center"
        >
          <p className="text-sm uppercase tracking-widest text-white/80 mb-4 font-[family-name:var(--font-inter)]">
            {occasion}
          </p>
          
          <p className="text-3xl md:text-4xl text-white leading-relaxed font-[family-name:var(--font-poppins)]">
            {message}
          </p>
        </motion.div>
        
        {/* Music Control */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={toggleMusic}
          className="mt-12 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          {isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </motion.button>
      </div>
      
      {/* Audio element */}
      <audio ref={audioRef} src={musicUrl} loop />
    </div>
  );
}

// ============================================
// TEMPLATE 4: MESSAGE + IMAGE + VOICE (Interactive)
// ============================================
// Use case: Personal video messages, voice greetings
// Assets used: MESSAGE + IMAGE + VOICE

export function VoiceMessageCardTemplate({
  message,
  imageUrl,
  voiceUrl,
  senderName = "Someone Special"
}: {
  message: string;
  imageUrl: string;
  voiceUrl: string;
  senderName?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const playVoice = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };
  
  return (
    <div data-template-root="true" className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="max-w-2xl w-full mx-8">
        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Image Header */}
          <div className="relative h-64 overflow-hidden">
            <img 
              src={imageUrl}
              alt="Card"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          
          {/* Message Content */}
          <div className="p-8 md:p-12">
            <p className="text-2xl text-gray-800 leading-relaxed mb-8 font-[family-name:var(--font-inter)]">
              {message}
            </p>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 font-[family-name:var(--font-poppins)]">
                From {senderName}
              </p>
              
              {/* Voice Play Button */}
              <button
                onClick={playVoice}
                disabled={isPlaying}
                className="group flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                <span className="text-sm font-medium">
                  {isPlaying ? "Playing..." : "Listen to Voice Message"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      
      <audio ref={audioRef} src={voiceUrl} />
    </div>
  );
}

// ============================================
// TEMPLATE 5: FULL FEATURED (All Assets)
// ============================================
// Use case: Premium experiences, wedding invites, milestone celebrations
// Assets used: MESSAGE + IMAGE + VOICE + MUSIC + VIDEO

export function UltimateExperienceTemplate({
  message,
  imageUrl,
  voiceUrl,
  musicUrl,
  videoUrl,
  occasion = "A Special Moment"
}: {
  message: string;
  imageUrl: string;
  voiceUrl: string;
  musicUrl: string;
  videoUrl?: string;
  occasion?: string;
}) {
  const [activeMedia, setActiveMedia] = useState<"video" | "image">("video");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  
  const musicRef = useRef<HTMLAudioElement>(null);
  const voiceRef = useRef<HTMLAudioElement>(null);
  
  const toggleMusic = () => {
    if (musicRef.current) {
      if (isMusicPlaying) {
        musicRef.current.pause();
      } else {
        musicRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };
  
  const playVoice = () => {
    if (voiceRef.current) {
      voiceRef.current.play();
      setIsVoicePlaying(true);
      voiceRef.current.onended = () => setIsVoicePlaying(false);
    }
  };
  
  return (
    <div data-template-root="true" className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Media */}
      <div className="absolute inset-0">
        {activeMedia === "video" && videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={imageUrl}
            alt="Background"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>
      
      {/* Content Overlay */}
      <div className="relative h-full flex flex-col">
        {/* Top Controls */}
        <div className="flex justify-between items-center p-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm uppercase tracking-widest text-white/80 font-[family-name:var(--font-inter)]"
          >
            {occasion}
          </motion.p>
          
          <div className="flex gap-3">
            {/* Toggle Video/Image */}
            {videoUrl && (
              <button
                onClick={() => setActiveMedia(activeMedia === "video" ? "image" : "video")}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 15l5.5-3.5L8 8z"/>
                </svg>
              </button>
            )}
            
            {/* Music Toggle */}
            <button
              onClick={toggleMusic}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition"
            >
              {isMusicPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Center Message */}
        <div className="flex-1 flex items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl text-center"
          >
            <p className="text-4xl md:text-5xl lg:text-6xl text-white leading-relaxed font-[family-name:var(--font-poppins)]">
              {message}
            </p>
          </motion.div>
        </div>
        
        {/* Bottom Voice Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="p-8 flex justify-center"
        >
          <button
            onClick={playVoice}
            disabled={isVoicePlaying}
            className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 disabled:opacity-50 rounded-full transition"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            </svg>
            <span className="text-white font-medium">
              {isVoicePlaying ? "Playing Voice Message..." : "Play Voice Message"}
            </span>
          </button>
        </motion.div>
      </div>
      
      {/* Audio elements */}
      <audio ref={musicRef} src={musicUrl} loop />
      <audio ref={voiceRef} src={voiceUrl} />
    </div>
  );
}

// ============================================
// TEMPLATE PREVIEW COMPONENT
// ============================================
// Shows all templates with sample data

export function TemplateShowcase() {
  const sampleData = {
    message: "Wishing you a day filled with love, laughter, and all the joy your heart can hold. You deserve nothing but the best!",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
    voiceUrl: "/sample-voice.mp3",
    musicUrl: "/sample-music.mp3",
    videoUrl: "/sample-video.mp4",
  };
  
  return (
    <div className="space-y-20 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Template 1: Minimalist Message</h2>
        <div className="border-4 border-gray-200 rounded-lg overflow-hidden h-[600px]">
          <MinimalistMessageTemplate message={sampleData.message} />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Template 2: Classic Photo Card</h2>
        <div className="border-4 border-gray-200 rounded-lg overflow-hidden h-[600px]">
          <ClassicPhotoCardTemplate 
            message={sampleData.message}
            imageUrl={sampleData.imageUrl}
          />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Template 3: Romantic Music Card</h2>
        <div className="border-4 border-gray-200 rounded-lg overflow-hidden h-[600px]">
          <RomanticMusicCardTemplate
            message={sampleData.message}
            imageUrl={sampleData.imageUrl}
            musicUrl={sampleData.musicUrl}
          />
        </div>
      </div>
    </div>
  );
}
