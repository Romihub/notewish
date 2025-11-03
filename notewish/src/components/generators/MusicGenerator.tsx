"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCardStore } from "@/store/useCardStore";
import { uploadMusicToStorage, saveCardToFirestore } from "@/lib/storage";

type ComponentStatus = "empty" | "generating" | "complete";

interface MusicGeneratorProps {
  cardId: string;
  cardTitle: string;
  occasion: string;
  recipientName: string;
  personalMessage: string;
  templateId: string;
  status: ComponentStatus;
  setStatus: (status: ComponentStatus) => void;
}

export default function MusicGenerator({
  cardId,
  cardTitle,
  occasion,
  recipientName,
  personalMessage,
  templateId,
  status,
  setStatus,
}: MusicGeneratorProps) {
  // Zustand store
  const { setGeneratedSong } = useCardStore();

  // Tab selection: 'instrumental' or 'vocals'
  const [musicType, setMusicType] = useState<'instrumental' | 'vocals'>('instrumental');

  // Music generator options
  const [selectedMusicStyles, setSelectedMusicStyles] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [musicDuration, setMusicDuration] = useState(30);
  const [tempo, setTempo] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [vocalGender, setVocalGender] = useState<'male' | 'female' | 'surprise'>('male');
  const [lyrics, setLyrics] = useState("");
  const [isStylesExpanded, setIsStylesExpanded] = useState(false);
  const [isMoodsExpanded, setIsMoodsExpanded] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [generatedMusicPrompt, setGeneratedMusicPrompt] = useState<string | null>(null);

  // Character limits based on duration
  const getLyricsCharLimit = (duration: number) => {
    const limitsMap: Record<number, number> = {
      15: 165,
      30: 350,
      60: 650,
      90: 1250,
      120: 1850,
    };
    return limitsMap[duration] || 200;
  };

  // Toggle selection helpers
  const toggleMusicStyle = (style: string) => {
    setSelectedMusicStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : prev.length < 2 ? [...prev, style] : prev
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : prev.length < 3 ? [...prev, mood] : prev
    );
  };

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument)
        : prev.length < 4 ? [...prev, instrument] : prev
    );
  };

  // Handler for Music generation with Firebase Storage integration
  const handleGenerateMusic = async () => {
    console.log('🎵 [MUSIC GEN] Starting music generation...');
    console.log('🎵 [MUSIC GEN] Card ID:', cardId);
    
    if (selectedMusicStyles.length === 0 || selectedMoods.length === 0) {
      toast.error('Please select at least 1 music style and 1 mood');
      return;
    }

    setStatus('generating');
    const loadingToast = toast.loading('Creating your custom music...');

    try {
      // Step 1: Generate music with AI
      console.log('🎵 [STEP 1] Calling ElevenLabs API...');
      const requestBody = {
        moods: selectedMoods,
        styles: selectedMusicStyles,
        instruments: selectedInstruments,
        duration: musicDuration,
        tempo: tempo,
        hasVocals: musicType === 'vocals',
        vocalGender: musicType === 'vocals' ? vocalGender : undefined,
        lyrics: musicType === 'vocals' ? lyrics : undefined,
      };
      console.log('🎵 [STEP 1] Request body:', requestBody);
      
      const response = await fetch('/api/generate/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('🎵 [STEP 1] Response status:', response.status);
      const data = await response.json();
      console.log('🎵 [STEP 1] Response data:', data);

      if (data.success && data.audioUrl) {
        console.log('🎵 [STEP 1] ✅ Music generated successfully!');
        console.log('🎵 [STEP 1] Audio URL (first 100 chars):', data.audioUrl.substring(0, 100));
        
        toast.loading('Uploading to cloud storage...', { id: loadingToast });
        
        // Step 2: Upload to Firebase Storage
        console.log('🎵 [STEP 2] Starting Firebase Storage upload...');
        console.log('🎵 [STEP 2] Card ID:', cardId);
        const permanentUrl = await uploadMusicToStorage(cardId, data.audioUrl);
        console.log('🎵 [STEP 2] ✅ Upload successful!');
        console.log('🎵 [STEP 2] Permanent URL:', permanentUrl);
        
        // Step 3: Save complete card data to Firestore (creates or updates document)
        console.log('🎵 [STEP 3] Saving to Firestore...');
        const cardData = {
          id: cardId,
          title: cardTitle,
          occasion,
          recipientName,
          personalMessage,
          templateId,
          assets: {
            musicUrl: permanentUrl,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        console.log('🎵 [STEP 3] Card data to save:', cardData);
        
        await saveCardToFirestore(cardData);
        console.log('🎵 [STEP 3] ✅ Firestore save successful!');
        
        // Step 4: Update Zustand store
        console.log('🎵 [STEP 4] Updating Zustand store...');
        const songTitle = lyrics ? lyrics.split('\n')[0] : `${selectedMusicStyles[0]} song`;
        setGeneratedSong(permanentUrl, songTitle);
        console.log('🎵 [STEP 4] ✅ Zustand updated with song URL and title!');
        
        // Step 5: Update local state for display
        console.log('🎵 [STEP 5] Updating local state...');
        setStatus('complete');
        setGeneratedMusicUrl(permanentUrl);
        setGeneratedMusicPrompt(data.prompt);
        console.log('🎵 [STEP 5] ✅ Local state updated!');
        
        console.log('🎵 [SUCCESS] 🎉 All steps completed!');
        toast.success('Music generated and saved successfully!', { id: loadingToast });
      } else {
        console.error('🎵 [STEP 1] ❌ API returned failure:', data);
        throw new Error(data.error || 'Failed to generate music');
      }
    } catch (error: any) {
      console.error('🎵 [ERROR] ❌ Music generation failed!');
      console.error('🎵 [ERROR] Error message:', error.message);
      console.error('🎵 [ERROR] Error stack:', error.stack);
      console.error('🎵 [ERROR] Full error object:', error);
      setStatus('empty');
      toast.error(error.message || 'Failed to generate music', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Music Generation
        </h2>
        <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] flex items-center gap-2">
          <span className="text-purple-500">🎵</span>
          Create custom music with AI
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="mb-8">
        <div className="flex gap-2 bg-purple-100/50 p-1 rounded-lg border border-purple-200">
          <button
            onClick={() => setMusicType('instrumental')}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-bold transition-all font-[family-name:var(--font-poppins)] ${
              musicType === 'instrumental'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-700 hover:text-purple-900'
            }`}
          >
            <span className="mr-1.5">🎹</span>
            Instrumental
          </button>
          <button
            onClick={() => setMusicType('vocals')}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-bold transition-all font-[family-name:var(--font-poppins)] ${
              musicType === 'vocals'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-700 hover:text-purple-900'
            }`}
          >
            <span className="mr-1.5">🎤</span>
            Song w/ Vocals
          </button>
        </div>
      </div>

      {/* Music Style & Mood Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Music Style */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
            Music Style <span className="text-xs text-gray-500">(Select 1-2)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "upbeat", label: "Upbeat" },
              { value: "calm", label: "Calm" },
              { value: "romantic", label: "Romantic" },
              { value: "epic", label: "Epic" },
              { value: "jazzy", label: "Jazz" },
              { value: "afrobeat", label: "Afrobeat" },
              { value: "pop", label: "Pop" },
              { value: "blues", label: "Blues" },
              { value: "country", label: "Country" },
              { value: "classical", label: "Classical" },
              { value: "rock", label: "Rock" },
              { value: "latin", label: "Latin" },
              { value: "children", label: "Children" },
              { value: "hiphop", label: "Hip Hop" },
              { value: "rap", label: "Rap" }
            ].slice(0, isStylesExpanded ? 15 : 6).map((style) => (
              <button
                key={style.value}
                onClick={() => toggleMusicStyle(style.value)}
                className={`px-3 py-2 text-xs rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                  selectedMusicStyles.includes(style.value)
                    ? "bg-purple-500 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsStylesExpanded(!isStylesExpanded)}
            className="w-full mt-2 py-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium font-[family-name:var(--font-poppins)] flex items-center justify-center gap-1"
          >
            {isStylesExpanded ? (
              <>Show less <span>↑</span></>
            ) : (
              <>Show more <span>↓</span></>
            )}
          </button>
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
            Mood/Vibe <span className="text-xs text-gray-500">(Select 1-3)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "happy", label: "Happy" },
              { value: "peaceful", label: "Peaceful" },
              { value: "dramatic", label: "Dramatic" },
              { value: "nostalgic", label: "Nostalgic" },
              { value: "playful", label: "Playful" },
              { value: "energetic", label: "Energetic" },
              { value: "celebratory", label: "Celebratory" },
              { value: "uplifting", label: "Uplifting" }
            ].slice(0, isMoodsExpanded ? 8 : 6).map((mood) => (
              <button
                key={mood.value}
                onClick={() => toggleMood(mood.value)}
                className={`px-3 py-2 text-xs rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                  selectedMoods.includes(mood.value)
                    ? "bg-purple-500 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsMoodsExpanded(!isMoodsExpanded)}
            className="w-full mt-2 py-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium font-[family-name:var(--font-poppins)] flex items-center justify-center gap-1"
          >
            {isMoodsExpanded ? (
              <>Show less <span>↑</span></>
            ) : (
              <>Show more <span>↓</span></>
            )}
          </button>
        </div>
      </div>

      {/* Instruments */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Instruments <span className="text-xs text-gray-500">(Optional, up to 4)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "piano", label: "Piano" },
            { value: "guitar", label: "Guitar" },
            { value: "violin", label: "Violin" },
            { value: "drums", label: "Drums" },
            { value: "bass", label: "Bass" },
            { value: "saxophone", label: "Saxophone" },
            { value: "synthesizer", label: "Synthesizer" },
            { value: "flute", label: "Flute" }
          ].map((instrument) => (
            <button
              key={instrument.value}
              onClick={() => toggleInstrument(instrument.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all font-[family-name:var(--font-inter)] ${
                selectedInstruments.includes(instrument.value)
                  ? "bg-purple-500 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {instrument.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Duration
        </label>
        <div className="flex gap-3">
          {[15, 30, 60, 90, 120].map((duration) => (
            <button
              key={duration}
              onClick={() => setMusicDuration(duration)}
              className={`px-4 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                musicDuration === duration
                  ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {duration}s
            </button>
          ))}
        </div>
      </div>

      {/* Tempo */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Tempo
        </label>
        <div className="flex gap-3">
          {[
            { value: 'slow', label: 'Slow', desc: 'Relaxed pace' },
            { value: 'medium', label: 'Medium', desc: 'Moderate pace' },
            { value: 'fast', label: 'Fast', desc: 'Energetic pace' }
          ].map((tempoOption) => (
            <button
              key={tempoOption.value}
              onClick={() => setTempo(tempoOption.value as 'slow' | 'medium' | 'fast')}
              className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                tempo === tempoOption.value
                  ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div className={`text-sm font-medium font-[family-name:var(--font-poppins)] ${
                tempo === tempoOption.value ? "text-white" : "text-gray-900"
              }`}>
                {tempoOption.label}
              </div>
              <div className={`text-xs font-[family-name:var(--font-inter)] ${
                tempo === tempoOption.value ? "text-gray-300" : "text-gray-500"
              }`}>
                {tempoOption.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Vocal Gender/Voice - Only for 'vocals' type */}
      {musicType === 'vocals' && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
            Voice/Gender
          </label>
        <div className="flex gap-3">
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'surprise', label: 'Surprise Me' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setVocalGender(option.value as 'male' | 'female' | 'surprise')}
              className={`flex-1 px-4 py-2 text-sm rounded-xl transition-all font-[family-name:var(--font-inter)] ${
                vocalGender === option.value
                  ? "bg-gray-900 text-white shadow-[0_0_0_2px_rgba(168,85,247,0.3)]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
          <p className="text-xs text-gray-500 mt-2 font-[family-name:var(--font-inter)]">
            Choose the voice type for your song. "Surprise Me" lets the AI decide!
          </p>
        </div>
      )}

      {/* Lyrics - Only for 'vocals' type */}
      {musicType === 'vocals' && (
        <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
            Lyrics (Optional)
          </label>
          <span className="text-xs text-gray-500 font-[family-name:var(--font-inter)]">
            {lyrics.length} / {getLyricsCharLimit(musicDuration)} characters
          </span>
        </div>
        <textarea
          value={lyrics}
          onChange={(e) => {
            const limit = getLyricsCharLimit(musicDuration);
            if (e.target.value.length <= limit) {
              setLyrics(e.target.value);
            }
          }}
          placeholder="Enter your song lyrics here... (Optional)"
          rows={6}
          maxLength={getLyricsCharLimit(musicDuration)}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-[family-name:var(--font-inter)]"
        />
          <p className="text-xs text-gray-500 mt-1 font-[family-name:var(--font-inter)]">
            Character limit adjusts based on duration selection
          </p>
        </div>
      )}

      {/* Generate Button */}
      <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t border-gray-100">
        <button 
          onClick={handleGenerateMusic}
          disabled={selectedMusicStyles.length === 0 || selectedMoods.length === 0 || status === 'generating'}
          className="w-full py-3 rounded-lg text-base font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'generating' ? 'Generating...' : 'Generate Music'}
        </button>
      </div>

      {/* Output Area */}
      <div className="mt-8">
        {generatedMusicUrl ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎵</span>
              <h3 className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                Your Generated Music
              </h3>
            </div>
            
            {/* Audio Player */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <audio 
                controls 
                className="w-full"
                src={generatedMusicUrl}
              >
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Music Details */}
            {generatedMusicPrompt && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2 font-[family-name:var(--font-poppins)]">
                  Music Prompt:
                </p>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                  {generatedMusicPrompt}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={handleGenerateMusic}
                className="flex-1 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-all font-[family-name:var(--font-poppins)]"
              >
                ↻ Regenerate
              </button>
              <button 
                onClick={() => {
                  setGeneratedMusicUrl(null);
                  setGeneratedMusicPrompt(null);
                  setStatus('empty');
                }}
                className="flex-1 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all font-[family-name:var(--font-poppins)]"
              >
                ✕ Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-500 font-[family-name:var(--font-inter)]">
              Generated music will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
