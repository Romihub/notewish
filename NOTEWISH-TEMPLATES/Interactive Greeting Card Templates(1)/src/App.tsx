import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassicFoldCard } from './components/ClassicFoldCard';
import { StoryMotionCard } from './components/StoryMotionCard';
import { VoiceMessageCard } from './components/VoiceMessageCard';
import { MixedMediaCard } from './components/MixedMediaCard';
import { MinimalMoodCard } from './components/MinimalMoodCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [currentCard, setCurrentCard] = useState<'fold' | 'story' | 'voice' | 'mixed' | 'minimal'>('fold');

  const templates = [
    { id: 'fold', name: 'Classic Fold', component: ClassicFoldCard },
    { id: 'story', name: 'Story Motion', component: StoryMotionCard },
    { id: 'voice', name: 'Voice Message', component: VoiceMessageCard },
    { id: 'mixed', name: 'Mixed Media', component: MixedMediaCard },
    { id: 'minimal', name: 'Minimal Mood', component: MinimalMoodCard }
  ];

  const currentIndex = templates.findIndex(t => t.id === currentCard);
  const CurrentComponent = templates[currentIndex].component;

  const nextCard = () => {
    const nextIndex = (currentIndex + 1) % templates.length;
    setCurrentCard(templates[nextIndex].id as 'fold' | 'story' | 'voice' | 'mixed' | 'minimal');
  };

  const prevCard = () => {
    const prevIndex = (currentIndex - 1 + templates.length) % templates.length;
    setCurrentCard(templates[prevIndex].id as 'fold' | 'story' | 'voice' | 'mixed' | 'minimal');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Card display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full"
        >
          <CurrentComponent />
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex items-center justify-between pointer-events-none z-50">
        <motion.button
          onClick={prevCard}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center pointer-events-auto group hover:bg-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-gray-900" />
        </motion.button>

        <motion.button
          onClick={nextCard}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center pointer-events-auto group hover:bg-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-gray-900" />
        </motion.button>
      </div>

      {/* Template indicator */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setCurrentCard(template.id as 'fold' | 'story' | 'voice' | 'mixed' | 'minimal')}
                className="relative px-4 py-1 transition-colors"
              >
                <span className={`relative z-10 ${
                  currentCard === template.id 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  {template.name}
                </span>
                {currentCard === template.id && (
                  <motion.div
                    layoutId="active-template"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    transition={{ type: 'spring', duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Template indicator dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {templates.map((template, index) => (
          <motion.button
            key={template.id}
            onClick={() => setCurrentCard(template.id as 'fold' | 'story' | 'voice' | 'mixed' | 'minimal')}
            className="group"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className={`w-2 h-2 rounded-full transition-all ${
              currentCard === template.id 
                ? 'bg-white w-8' 
                : 'bg-white/40 group-hover:bg-white/60'
            }`} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}