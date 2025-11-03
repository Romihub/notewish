import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GeneratedContent {
  message?: string;
  messageVariations?: string[];  // Array of 5 message variations
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  musicUrl?: string;             // Background music
  songUrl?: string;              // Generated song
  songTitle?: string;            // Song title
}

interface CardState {
  // Card basics
  cardId: string;
  cardTitle: string;
  occasion: string;
  recipientName: string;
  personalMessage: string;
  
  // Generated content
  generatedContent: GeneratedContent;
  
  // Loading states
  isGeneratingMessage: boolean;
  isGeneratingImage: boolean;
  isGeneratingVoice: boolean;
  isGeneratingVideo: boolean;
  isGeneratingMusic: boolean;
  
  // Actions
  setCardTitle: (title: string) => void;
  setOccasion: (occasion: string) => void;
  setRecipientName: (name: string) => void;
  setPersonalMessage: (message: string) => void;
  
  // Generated content setters
  setGeneratedMessage: (message: string) => void;
  setGeneratedMessageVariations: (variations: string[]) => void;
  setGeneratedImage: (imageUrl: string) => void;
  setGeneratedVoice: (audioUrl: string) => void;
  setGeneratedVideo: (videoUrl: string) => void;
  setGeneratedMusic: (musicUrl: string) => void;
  setGeneratedSong: (songUrl: string, songTitle?: string) => void;
  
  // Loading state setters
  setIsGeneratingMessage: (isGenerating: boolean) => void;
  setIsGeneratingImage: (isGenerating: boolean) => void;
  setIsGeneratingVoice: (isGenerating: boolean) => void;
  setIsGeneratingVideo: (isGenerating: boolean) => void;
  setIsGeneratingMusic: (isGenerating: boolean) => void;
  
  // Auto-save
  lastSaved: Date | null;
  setLastSaved: () => void;
  
  // Reset
  resetCard: () => void;
}

export const useCardStore = create<CardState>()(
  persist(
    (set) => ({
      // Initial state
      cardId: '',
      cardTitle: 'Untitled Card',
      occasion: '',
      recipientName: '',
      personalMessage: '',
      
      generatedContent: {},
      
      isGeneratingMessage: false,
      isGeneratingImage: false,
      isGeneratingVoice: false,
      isGeneratingVideo: false,
      isGeneratingMusic: false,
      
      lastSaved: null,
      
      // Actions
      setCardTitle: (title) => set({ cardTitle: title }),
      setOccasion: (occasion) => set({ occasion }),
      setRecipientName: (name) => set({ recipientName: name }),
      setPersonalMessage: (message) => set({ personalMessage: message }),
      
      setGeneratedMessage: (message) =>
        set((state) => ({
          generatedContent: { ...state.generatedContent, message },
        })),
      
      setGeneratedMessageVariations: (variations) =>
        set((state) => ({
          generatedContent: { ...state.generatedContent, messageVariations: variations },
        })),
      
      setGeneratedImage: (imageUrl) =>
        set((state) => ({
          generatedContent: { ...state.generatedContent, imageUrl },
        })),
      
      setGeneratedVoice: (audioUrl) =>
        set((state) => ({
          generatedContent: { ...state.generatedContent, audioUrl },
        })),
      
      setGeneratedVideo: (videoUrl) =>
        set((state) => ({
          generatedContent: { ...state.generatedContent, videoUrl },
        })),
      
      setGeneratedMusic: (musicUrl) =>
        set((state) => ({
          generatedContent: { ...state.generatedContent, musicUrl },
        })),
      
      setGeneratedSong: (songUrl, songTitle) =>
        set((state) => ({
          generatedContent: { ...state.generatedContent, songUrl, songTitle },
        })),
      
      setIsGeneratingMessage: (isGenerating) =>
        set({ isGeneratingMessage: isGenerating }),
      
      setIsGeneratingImage: (isGenerating) =>
        set({ isGeneratingImage: isGenerating }),
      
      setIsGeneratingVoice: (isGenerating) =>
        set({ isGeneratingVoice: isGenerating }),
      
      setIsGeneratingVideo: (isGenerating) =>
        set({ isGeneratingVideo: isGenerating }),
      
      setIsGeneratingMusic: (isGenerating) =>
        set({ isGeneratingMusic: isGenerating }),
      
      setLastSaved: () => set({ lastSaved: new Date() }),
      
      resetCard: () =>
        set({
          cardTitle: 'Untitled Card',
          occasion: '',
          recipientName: '',
          personalMessage: '',
          generatedContent: {},
          isGeneratingMessage: false,
          isGeneratingImage: false,
          isGeneratingVoice: false,
          isGeneratingVideo: false,
          isGeneratingMusic: false,
        }),
    }),
    {
      name: 'notewish-card-storage',
      partialize: (state) => ({
        cardId: state.cardId,
        cardTitle: state.cardTitle,
        occasion: state.occasion,
        recipientName: state.recipientName,
        personalMessage: state.personalMessage,
        generatedContent: state.generatedContent,
        lastSaved: state.lastSaved,
      }),
    }
  )
);
