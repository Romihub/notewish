import React from 'react';
import { AbsoluteFill, Audio, Img, Video, useCurrentFrame, interpolate } from 'remotion';

interface PageSequenceProps {
  page: any;
  pageIndex: number;
  cardData: any;
  duration: number;
}

export const PageSequence: React.FC<PageSequenceProps> = ({ 
  page, 
  pageIndex, 
  cardData,
  duration 
}) => {
  const frame = useCurrentFrame();
  
  // Fade in animation
  const opacity = interpolate(
    frame,
    [0, 15],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Render different page types
  const renderPageContent = () => {
    switch (page.type) {
      case 'cover':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: 40,
          }}>
            <h1 style={{ fontSize: 80, color: '#fff', margin: 0, fontFamily: 'Arial' }}>
              {cardData.title || 'Greeting Card'}
            </h1>
            {cardData.subtitle && (
              <p style={{ fontSize: 40, color: '#fff', margin: '20px 0 0', fontFamily: 'Arial' }}>
                {cardData.subtitle}
              </p>
            )}
          </div>
        );

      case 'image':
        return page.imageUrl ? (
          <Img 
            src={page.imageUrl} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain' 
            }} 
          />
        ) : null;

      case 'video':
        return page.videoUrl ? (
          <Video 
            src={page.videoUrl} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain' 
            }} 
          />
        ) : null;

      case 'voice':
      case 'message':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: 60,
          }}>
            {page.text && (
              <p style={{ 
                fontSize: 48, 
                color: '#fff', 
                textAlign: 'center',
                fontFamily: 'Arial',
                lineHeight: 1.5,
                maxWidth: '80%',
              }}>
                {page.text}
              </p>
            )}
            {page.audioUrl && <Audio src={page.audioUrl} />}
          </div>
        );

      case 'music':
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          }}>
            <div style={{ fontSize: 60, color: '#fff', fontFamily: 'Arial' }}>
              🎵 Music 🎵
            </div>
            {page.audioUrl && <Audio src={page.audioUrl} />}
          </div>
        );

      default:
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
          }}>
            <p style={{ fontSize: 40, color: '#333' }}>Page {pageIndex + 1}</p>
          </div>
        );
    }
  };

  return (
    <AbsoluteFill style={{ opacity }}>
      {renderPageContent()}
    </AbsoluteFill>
  );
};
