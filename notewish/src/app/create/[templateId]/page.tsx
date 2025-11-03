"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useCardStore } from "@/store/useCardStore";
import MusicGenerator from "@/components/generators/MusicGenerator";
import VideoGenerator from "@/components/generators/VideoGenerator";
import MessageGenerator from "@/components/generators/MessageGenerator";
import ImageGenerator from "@/components/generators/ImageGenerator";
import VoiceGenerator from "@/components/generators/VoiceGenerator";
import { 
  getTemplateConfig, 
  isGeneratorAllowedSync, 
  isGeneratorRequiredSync,
  type TemplateConfig,
  type GeneratorType 
} from "@/config/templateConfig";

type GeneratorTab = "message" | "image" | "voice" | "video" | "music";
type ComponentStatus = "empty" | "generating" | "complete";

export default function CreationWorkspace() {
  const params = useParams();
  const templateId = params?.templateId as string || 'default';
  const [cardId] = useState(() => `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalCardTitle, setOriginalCardTitle] = useState("");
  
  const [activeTab, setActiveTab] = useState<GeneratorTab>("message");
  const [cardTitle, setCardTitle] = useState("Untitled Card");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Zustand store
  const { 
    generatedContent,
    setGeneratedMusic, 
    setGeneratedMessageVariations,
    setGeneratedSong,
    setLastSaved,
    resetCard
  } = useCardStore();
  
  // Basic Info
  const [occasion, setOccasion] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [greetings, setGreetings] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");

  // Component statuses
  const [messageStatus, setMessageStatus] = useState<ComponentStatus>("empty");
  const [imageStatus, setImageStatus] = useState<ComponentStatus>("empty");
  const [voiceStatus, setVoiceStatus] = useState<ComponentStatus>("empty");
  const [videoStatus, setVideoStatus] = useState<ComponentStatus>("empty");
  const [musicStatus, setMusicStatus] = useState<ComponentStatus>("empty");
  const [isSaving, setIsSaving] = useState(false);

  // Template configuration
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);

  // Load template configuration on mount
  useEffect(() => {
    getTemplateConfig(templateId).then(config => {
      setTemplateConfig(config);
    });
  }, [templateId]);

  // Auto-scroll to Content Generators section when status changes to complete
  useEffect(() => {
    const hasAnyComplete = [messageStatus, imageStatus, voiceStatus, videoStatus, musicStatus].includes("complete");
    if (hasAnyComplete) {
      const generatorsSection = document.querySelector('.content-generators-section');
      if (generatorsSection) {
        generatorsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [messageStatus, imageStatus, voiceStatus, videoStatus, musicStatus]);

  // Load existing card data if in edit mode, OR reset store for new card
  useEffect(() => {
    const loadExistingCard = async () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const existingCardId = urlParams.get('cardId');
        
        if (existingCardId) {
          try {
            const { getCardFromFirestore } = await import('@/lib/storage');
            const cardData = await getCardFromFirestore(existingCardId);
            
            if (cardData) {
              setIsEditMode(true);
              setOriginalCardTitle(cardData.title);
              setCardTitle(cardData.title);
              setOccasion(cardData.occasion);
              setRecipientName(cardData.recipientName);
              setGreetings(cardData.greetings || "");
              setPersonalMessage(cardData.personalMessage);
              
              // Load assets into store
              // TODO: Set generated content in Zustand store
              
              toast.success('Card loaded successfully!');
            }
          } catch (error) {
            console.error('Error loading card:', error);
            toast.error('Failed to load card');
          }
        } else {
          // NEW CARD - Reset the store to clear old data
          console.log('🆕 [NEW CARD] Resetting Zustand store to clear previous card data');
          resetCard();
        }
      }
    };
    
    loadExistingCard();
  }, [resetCard]);

  // Save card to Firestore
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      
      // Check for duplicate card names (only if title has changed from original)
      if (isEditMode && cardTitle !== originalCardTitle) {
        const { getAllCardsFromFirestore } = await import('@/lib/storage');
        const allCards = await getAllCardsFromFirestore();
        const duplicateExists = allCards.some(card => 
          card.title.toLowerCase() === cardTitle.toLowerCase() && card.id !== cardId
        );
        
        if (duplicateExists) {
          toast.error('A card with this name already exists. Please choose a different name.');
          setIsSaving(false);
          return;
        }
      } else if (!isEditMode) {
        // For new cards, always check for duplicates
        const { getAllCardsFromFirestore } = await import('@/lib/storage');
        const allCards = await getAllCardsFromFirestore();
        const duplicateExists = allCards.some(card => 
          card.title.toLowerCase() === cardTitle.toLowerCase()
        );
        
        if (duplicateExists) {
          toast.error('A card with this name already exists. Please choose a different name.');
          setIsSaving(false);
          return;
        }
      }
      
      // Filter out undefined values (Firebase doesn't allow them)
      const assets: any = {};
      if (generatedContent.messageVariations) assets.messageVariations = generatedContent.messageVariations;
      if (generatedContent.message) assets.message = generatedContent.message;
      if (generatedContent.songUrl) assets.songUrl = generatedContent.songUrl;
      if (generatedContent.songTitle) assets.songTitle = generatedContent.songTitle;
      if (generatedContent.musicUrl) assets.musicUrl = generatedContent.musicUrl;
      if (generatedContent.imageUrl) assets.imageUrl = generatedContent.imageUrl;
      if (generatedContent.audioUrl) assets.voiceUrl = generatedContent.audioUrl;
      if (generatedContent.videoUrl) assets.videoUrl = generatedContent.videoUrl;
      
      const cardData = {
        id: cardId,
        title: cardTitle,
        occasion,
        recipientName,
        greetings,
        personalMessage,
        templateId,
        assets,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { saveCardToFirestore } = await import('@/lib/storage');
      await saveCardToFirestore(cardData);
      
      setLastSaved();
      toast.success('Card saved successfully!');
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview card
  const handlePreview = async () => {
    // Check if any content has been generated
    const hasContent = 
      generatedContent.messageVariations?.length || 
      generatedContent.message ||
      generatedContent.songUrl || 
      generatedContent.musicUrl ||
      generatedContent.imageUrl ||
      generatedContent.audioUrl ||
      generatedContent.videoUrl;
      
    if (!hasContent) {
      toast.error('Please generate some content first!');
      return;
    }
    
    // Auto-save before preview
    await handleSaveDraft();
    
    // Redirect to preview page in a new tab
    window.open(`/preview/${cardId}`, '_blank');
  };

  const generators = [
    { id: "message", label: "Generate Message", icon: "📝", status: messageStatus },
    { id: "image", label: "Generate Image", icon: "🖼", status: imageStatus },
    { id: "voice", label: "Generate Voice", icon: "🎙", status: voiceStatus },
    { id: "video", label: "Generate Video", icon: "🎬", status: videoStatus },
    { id: "music", label: "Generate Music/Song", icon: "🎵", status: musicStatus },
  ];

  const getIcon = (iconName: string, isActive: boolean, isComplete: boolean) => {
    // Fix: Use purple for active/complete icons so they're visible on white background
    const iconClass = (isActive || isComplete) ? "text-purple-600" : "text-gray-600";
    
    switch(iconName) {
      case "message":
        return (
          <svg className={`w-4 h-4 ${iconClass}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        );
      case "image":
        return (
          <svg className={`w-4 h-4 ${iconClass}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        );
      case "voice":
        return (
          <svg className={`w-4 h-4 ${iconClass}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        );
      case "video":
        return (
          <svg className={`w-4 h-4 ${iconClass}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        );
      case "music":
        return (
          <svg className={`w-4 h-4 ${iconClass}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-[family-name:var(--font-inter)]">
      {/* Left Pane - Create Panel (Fixed, Full Height) */}
      <aside className="w-80 bg-gray-100 border-r border-gray-200 p-6 flex flex-col fixed h-screen overflow-y-auto">
        {/* Top: Back to Templates & Dashboard Icon */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/create" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium font-[family-name:var(--font-poppins)]">
              Back
            </span>
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors duration-200" title="Dashboard">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>

        {/* Untitled Card Section */}
        <div className="mb-6">
          {/* Card Title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              className="w-full text-base font-bold text-gray-900 bg-transparent border-b-2 border-gray-900 focus:outline-none font-[family-name:var(--font-poppins)] mb-2"
            />
          ) : (
            <div className="flex items-center justify-between group mb-2 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h2 className="text-base font-bold text-gray-900 font-[family-name:var(--font-poppins)] group-hover:text-purple-600 transition-colors">
                {cardTitle}
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 mb-4 font-[family-name:var(--font-inter)]">
            Saved 2 minutes ago
          </p>

          {/* Basic Information Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 font-[family-name:var(--font-poppins)]">
                Occasion
              </label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g., Birthday"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-[family-name:var(--font-inter)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 font-[family-name:var(--font-poppins)]">
                Recipient
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., Mom"
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-[family-name:var(--font-inter)]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-700 font-[family-name:var(--font-poppins)]">
                  Greetings
                </label>
                <span className="text-xs text-gray-500 font-[family-name:var(--font-inter)]">
                  {greetings.length}/60
                </span>
              </div>
              <input
                type="text"
                value={greetings}
                onChange={(e) => {
                  if (e.target.value.length <= 60) {
                    setGreetings(e.target.value);
                  }
                }}
                placeholder="e.g., Happy Birthday!"
                maxLength={60}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-[family-name:var(--font-inter)]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-700 font-[family-name:var(--font-poppins)]">
                  Personal Message
                </label>
                <span className="text-xs text-gray-500 font-[family-name:var(--font-inter)]">
                  {personalMessage.length}/60
                </span>
              </div>
              <textarea
                value={personalMessage}
                onChange={(e) => {
                  if (e.target.value.length <= 60) {
                    setPersonalMessage(e.target.value);
                  }
                }}
                placeholder="Share your thoughts..."
                rows={3}
                maxLength={60}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none font-[family-name:var(--font-inter)]"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-4"></div>

        {/* Last x Days */}
        <nav className="flex flex-col mb-4">
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase font-[family-name:var(--font-poppins)]">
            Last 3 Days
          </div>
          <Link href="/dashboard" className="flex items-center px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <span className="text-sm truncate">Birthday Card for Mom</span>
          </Link>
          <Link href="/dashboard" className="flex items-center px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <span className="text-sm truncate">Get Well Soon Card</span>
          </Link>
          <Link href="/dashboard" className="flex items-center px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <span className="text-sm truncate">Anniversary Wishes</span>
          </Link>
        </nav>

        {/* Quick Actions */}
        <nav className="flex flex-col gap-1 mb-4">
          <Link href="/create" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">Create New</span>
          </Link>
          <Link href="/dashboard" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Open Assets</span>
          </Link>
          <Link href="/templates" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-[family-name:var(--font-poppins)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span className="text-sm">View Templates</span>
          </Link>
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-300 my-4"></div>

        {/* Content Generators */}
        <nav className="flex flex-col gap-1 content-generators-section">
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase font-[family-name:var(--font-poppins)]">
            Content Generators
          </div>
          {generators.map((gen) => {
            // Check if generator is allowed for this template
            const isAllowed = templateConfig ? isGeneratorAllowedSync(templateConfig, gen.id as GeneratorType) : true;
            const isRequired = templateConfig ? isGeneratorRequiredSync(templateConfig, gen.id as GeneratorType) : false;
            
            return (
              <div key={gen.id} className="relative group">
                <button
                  onClick={() => isAllowed && setActiveTab(gen.id as GeneratorTab)}
                  disabled={!isAllowed}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 font-[family-name:var(--font-poppins)] ${
                    !isAllowed
                      ? "opacity-40 cursor-not-allowed text-gray-400"
                      : gen.status === "complete"
                      ? "bg-white text-gray-900 font-medium"
                      : activeTab === gen.id
                      ? "bg-white text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={!isAllowed ? "Not available for this template" : isRequired ? "Required for this template" : ""}
                >
                  {getIcon(gen.id, activeTab === gen.id && gen.status !== "complete", gen.status === "complete")}
                  <span className="text-sm flex-1 text-left">
                    {gen.label.replace("Generate ", "")}
                  </span>
                  {!isAllowed && (
                    <span className="text-xs text-gray-400">🚫</span>
                  )}
                  {isAllowed && isRequired && gen.status !== "complete" && (
                    <span className="text-xs text-orange-500" title="Required">*</span>
                  )}
                  {gen.status === "complete" && (
                    <span className="text-green-600">✓</span>
                  )}
                  {gen.status === "generating" && (
                    <span className="animate-spin">⏳</span>
                  )}
                </button>
                
                {/* Tooltip for disabled generators */}
                {!isAllowed && (
                  <div className="hidden group-hover:block absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                    Not available for this template
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Right Pane - Content Hub with Header (With left margin to account for fixed sidebar) */}
      <main className="flex-1 ml-80 flex flex-col overflow-hidden bg-white">
        {/* Top Navigation in Right Panel */}
        <nav className="bg-white border-b border-gray-200">
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-center relative">
              {/* Center - Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium font-[family-name:var(--font-poppins)] disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                <button 
                  onClick={handlePreview}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium font-[family-name:var(--font-poppins)]"
                >
                  Preview
                </button>
              </div>

              {/* Right - User Utilities */}
              <div className="absolute right-0 flex items-center gap-1.5">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Help & Support">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 font-[family-name:var(--font-poppins)]">
                    50 Credits
                  </span>
                </div>
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Profile">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Tab Navigation */}
        <div className="px-6 pt-4">
            <div className="flex gap-6">
              {generators.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => setActiveTab(gen.id as GeneratorTab)}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors font-[family-name:var(--font-poppins)] ${
                    activeTab === gen.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {gen.label.replace("Generate ", "")}
                </button>
              ))}
            </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "message" && (
              <MessageGenerator
                cardId={cardId}
                cardTitle={cardTitle}
                occasion={occasion}
                recipientName={recipientName}
                greetings={greetings}
                personalMessage={personalMessage}
                templateId={templateId}
                status={messageStatus}
                setStatus={setMessageStatus}
              />
            )}

            {/* IMAGE GENERATOR */}
            {activeTab === "image" && (
              <ImageGenerator
                cardId={cardId}
                cardTitle={cardTitle}
                occasion={occasion}
                recipientName={recipientName}
                personalMessage={personalMessage}
                templateId={templateId}
                status={imageStatus}
                setStatus={setImageStatus}
              />
            )}

            {/* VOICE GENERATOR */}
            {activeTab === "voice" && (
              <VoiceGenerator
                cardId={cardId}
                cardTitle={cardTitle}
                occasion={occasion}
                recipientName={recipientName}
                personalMessage={personalMessage}
                templateId={templateId}
                status={voiceStatus}
                setStatus={setVoiceStatus}
              />
            )}

            {/* MUSIC GENERATOR */}
            {activeTab === "music" && (
              <MusicGenerator
                cardId={cardId}
                cardTitle={cardTitle}
                occasion={occasion}
                recipientName={recipientName}
                personalMessage={personalMessage}
                templateId={templateId}
                status={musicStatus}
                setStatus={setMusicStatus}
              />
            )}

            {/* VIDEO GENERATOR */}
            {activeTab === "video" && (
              <VideoGenerator
                cardId={cardId}
                cardTitle={cardTitle}
                occasion={occasion}
                recipientName={recipientName}
                personalMessage={personalMessage}
                templateId={templateId}
                status={videoStatus}
                setStatus={setVideoStatus}
              />
            )}
        </div>
      </main>
    </div>
  );
}
