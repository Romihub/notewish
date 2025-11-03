import { NextRequest, NextResponse } from 'next/server';

// Note: This uses ElevenLabs API. You'll need to:
// 1. Sign up at https://elevenlabs.io/
// 2. Get your API key
// 3. Add ELEVENLABS_API_KEY to .env.local

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { text, voiceType = 'professional-female', speed = 1.0, style = 'natural' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your .env.local file.',
        },
        { status: 500 }
      );
    }

    // Map voice types to ElevenLabs voice IDs
    const voiceIdMap: Record<string, string> = {
      'professional-female': '21m00Tcm4TlvDq8ikWAM', // Rachel
      'casual-male': 'TxGEqnHWrfWFTfGW9XjX', // Josh
      'neutral': 'pNInz6obpgDQGcFmaJgB', // Adam
      'energetic': 'EXAVITQu4vr4xnSDxMaL', // Bella
    };

    const voiceId = voiceIdMap[voiceType] || voiceIdMap['professional-female'];

    // Map style to ElevenLabs stability and similarity_boost settings
    const styleSettings: Record<string, { stability: number; similarity_boost: number }> = {
      'natural': { stability: 0.5, similarity_boost: 0.75 },
      'expressive': { stability: 0.3, similarity_boost: 0.85 },
      'calm': { stability: 0.7, similarity_boost: 0.7 },
      'energetic': { stability: 0.4, similarity_boost: 0.8 },
    };

    const settings = styleSettings[style] || styleSettings['natural'];

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarity_boost,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.message || 'Failed to generate voice');
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      voiceId,
      creditsUsed: 1,
      modelUsed: 'elevenlabs-v1',
      characterCount: text.length,
    });
  } catch (error: any) {
    console.error('Error generating voice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate voice',
      },
      { status: 500 }
    );
  }
}
