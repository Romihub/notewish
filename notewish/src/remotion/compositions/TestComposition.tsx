import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const TestComposition: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill 
      style={{ 
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        opacity
      }}
    >
      <h1 style={{ 
        fontSize: 100, 
        color: '#fff',
        fontFamily: 'Arial'
      }}>
        ✅ REMOTION WORKS!
      </h1>
      <p style={{
        fontSize: 40,
        color: '#fff',
        marginTop: 20,
        fontFamily: 'Arial'
      }}>
        Frame: {frame}
      </p>
    </AbsoluteFill>
  );
};
