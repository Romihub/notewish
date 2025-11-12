import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { PageSequence } from './PageSequence';

interface CardCompositionProps {
  cardId: string;
  cardData: any;
}

export const CardComposition: React.FC<CardCompositionProps> = (props) => {
  const { fps } = useVideoConfig();
  
  const { cardData } = props;
  
  if (!cardData) {
    console.log('[COMPOSITION] No cardData - showing error screen');
    return (
      <AbsoluteFill style={{ backgroundColor: '#f00', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: 48 }}>ERROR: No Data</div>
      </AbsoluteFill>
    );
  }

  const assets = cardData.assets || {};
  
  // Build pages array
  const pages = [];
  
  // Cover page
  pages.push({ 
    type: 'cover', 
    title: cardData.greetings || `Happy ${cardData.occasion}!`,
    recipientName: cardData.recipientName,
    personalMessage: cardData.personalMessage,
    duration: 6 
  });
  
  // Image page
  if (assets.imageUrl) {
    pages.push({ type: 'image', imageUrl: assets.imageUrl, duration: 6 });
  }
  
  // Video page
  if (assets.videoUrl) {
    pages.push({ type: 'video', videoUrl: assets.videoUrl, duration: 6 });
  }
  
  // Voice page
  if (assets.voiceUrl) {
    pages.push({ 
      type: 'voice', 
      audioUrl: assets.voiceUrl, 
      text: cardData.personalMessage,
      duration: 6 
    });
  }
  
  // Message page
  if (assets.messageVariations && assets.messageVariations.length > 0) {
    pages.push({ 
      type: 'message', 
      text: assets.messageVariations[0],
      duration: 6 
    });
  }
  
  // Music page
  if (assets.songUrl) {
    pages.push({ 
      type: 'music', 
      audioUrl: assets.songUrl,
      songTitle: assets.songTitle,
      duration: 6 
    });
  }
  
  console.log('[COMPOSITION] Total pages:', pages.length);
  
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {pages.map((page: any, index: number) => {
        const duration = Math.round((page.duration || 6) * fps);
        const sequenceStart = currentFrame;
        currentFrame += duration;

        return (
          <Sequence
            key={index}
            from={sequenceStart}
            durationInFrames={duration}
          >
            <PageSequence
              page={page}
              pageIndex={index}
              cardData={cardData}
              duration={duration}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
