import React from 'react';
import { Composition } from 'remotion';
import { CardComposition } from './compositions/CardComposition';
import { TestComposition } from './compositions/TestComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestVideo"
        component={TestComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CardVideo"
        component={CardComposition as any}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={async ({ props }) => {
          // Props passed via inputProps will be available here
          const { cardData } = props as any;
          
          if (!cardData || !cardData.pages) {
            return {
              props,
              durationInFrames: 300,
              fps: 30,
            };
          }
          
          // Calculate total duration from pages
          const totalFrames = cardData.pages.reduce((total: number, page: any) => {
            return total + Math.round((page.duration || 5) * 30);
          }, 0);
          
          return {
            props,
            durationInFrames: totalFrames || 300,
            fps: 30,
          };
        }}
      />
    </>
  );
};
