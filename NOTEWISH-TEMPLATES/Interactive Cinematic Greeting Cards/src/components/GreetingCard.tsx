import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FloatingPetals } from "./FloatingPetals";
import { MusicIndicator } from "./MusicIndicator";

interface GreetingCardProps {
  coverImage: string;
  title: string;
  message: string;
}

export function GreetingCard({
  coverImage,
  title,
  message,
}: GreetingCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const handleCardClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setShowHint(false);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
      {/* Background with ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-100/30 to-blue-100/50" />
      
      {/* Soft table texture */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-white/20 to-white/40" />
      </div>

      {/* Card Container */}
      <div className="relative z-10">
        <motion.div
          className="relative cursor-pointer"
          style={{
            width: "400px",
            height: "550px",
            transformStyle: "preserve-3d",
          }}
          onClick={handleCardClick}
        >
          {/* Tap to open hint */}
          <AnimatePresence>
            {showHint && !isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 z-50"
              >
                <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-lg">
                  <motion.span
                    className="text-sm"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✨ Tap to open
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Left Half (Back cover when closed) */}
          <motion.div
            className="absolute left-0 top-0 w-1/2 h-full origin-right"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            animate={{
              rotateY: isOpen ? -180 : 0,
            }}
            transition={{
              duration: 1.2,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
          >
            {/* Front of left page (cover) */}
            <div
              className="absolute inset-0 rounded-l-2xl overflow-hidden shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${coverImage})`,
                  opacity: 0.7,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Cover title */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <motion.div
                  className="text-center"
                  animate={!isOpen ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: !isOpen ? Infinity : 0 }}
                >
                  <h1
                    className="text-white drop-shadow-lg text-4xl leading-tight"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {title}
                  </h1>
                </motion.div>
              </div>

              {/* Decorative border */}
              <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
            </div>

            {/* Back of left page (inside left) */}
            <div
              className="absolute inset-0 rounded-l-2xl overflow-hidden shadow-inner"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-white" />
              
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(219,39,119,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
              </div>

              {/* Inner border */}
              <div className="absolute inset-4 border border-purple-200/50 rounded-lg" />
            </div>

            {/* Shadow gradient for depth */}
            <motion.div
              className="absolute inset-y-0 -right-1 w-8 pointer-events-none"
              style={{
                background: "linear-gradient(to right, rgba(0,0,0,0.3), transparent)",
                transformStyle: "preserve-3d",
              }}
              animate={{
                opacity: isOpen ? 1 : 0,
              }}
            />
          </motion.div>

          {/* Card Right Half (Inside message) */}
          <motion.div
            className="absolute right-0 top-0 w-1/2 h-full rounded-r-2xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #fff5f7 0%, #f3e7ff 50%, #e6f7ff 100%)",
            }}
          >
            {/* Message content */}
            <div className="relative h-full p-8 flex flex-col">
              {/* Floating petals inside */}
              <AnimatePresence>
                {isOpen && <FloatingPetals />}
              </AnimatePresence>

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-center"
                  >
                    <p
                      className="text-gray-700 leading-relaxed italic"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {message}
                    </p>
                  </motion.div>
                </div>

                {/* Music indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="flex justify-center"
                >
                  <MusicIndicator isPlaying={isOpen} />
                </motion.div>
              </div>

              {/* Decorative sparkles */}
              {isOpen && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-yellow-300/60"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${10 + Math.random() * 80}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: 0.8 + i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    />
                  ))}
                </>
              )}

              {/* Inner border */}
              <div className="absolute inset-4 border border-purple-200/50 rounded-lg pointer-events-none" />
            </div>
          </motion.div>

          {/* Card spine/binding */}
          <div
            className="absolute left-1/2 top-0 w-2 h-full -translate-x-1/2 z-20 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(139,92,246,0.2), rgba(219,39,119,0.2))",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
            }}
          />
        </motion.div>

        {/* Card shadow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[570px] rounded-2xl -z-10"
          animate={{
            boxShadow: isOpen
              ? "0 30px 60px rgba(0,0,0,0.25), 0 10px 20px rgba(0,0,0,0.15)"
              : "0 20px 40px rgba(0,0,0,0.2), 0 5px 10px rgba(0,0,0,0.1)",
          }}
          transition={{ duration: 1.2 }}
        />
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/60"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
