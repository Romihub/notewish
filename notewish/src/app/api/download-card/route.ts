import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { cardId, useCompositionEngine } = await request.json();
    
    if (!cardId) {
      return NextResponse.json(
        { error: 'Missing cardId' },
        { status: 400 }
      );
    }

    // The URL for the isolated render view
    const renderUrl = `http://localhost:3004/render/${cardId}`;

    // Choose which video generation server to use
    // Port 4003: New composition-based system (recommended)
    // Port 4002: Old screenshot-based system (fallback)
    const serverPort = useCompositionEngine !== false ? 4003 : 4002;
    const serverName = serverPort === 4003 ? 'COMPOSITION' : 'LEGACY';
    
    console.log(`[DOWNLOAD] Using ${serverName} video generation server (port ${serverPort})`);

    // Call the separate video generation server
    const response = await fetch(`http://localhost:${serverPort}/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardId, url: renderUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Video generation server failed');
    }

    const videoBuffer = await response.arrayBuffer();

    // Return the video
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="notewish-card-${cardId}.mp4"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate card video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
