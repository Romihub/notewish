'use client';

import { ReactNode } from 'react';

export default function RenderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style jsx global>{`
        /* Hide Next.js dev indicator during rendering */
        #__next-build-watcher,
        [data-nextjs-scroll-focus-boundary],
        [data-nextjs-dialog-overlay],
        [id^="__next"],
        .__next-dev-overlay {
          display: none !important;
        }
        
        /* Ensure full viewport for render */
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
      {children}
    </>
  );
}
