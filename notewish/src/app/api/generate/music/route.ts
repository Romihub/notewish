import { NextRequest, NextResponse } from 'next/server';

// Note: This uses ElevenLabs Music Generation API. You'll need to:
// 1. Sign up at https://elevenlabs.io/
// 2. Get your API key (same key as voice generation)
// 3. Add ELEVENLABS_API_KEY to .env.local

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const {
      moods = [],
      styles = [],
      instruments = [],
      duration = 30,
      vocalGender = 'male',
      lyrics = '',
    } = await request.json();

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your .env.local file.',
        },
        { status: 500 }
      );
    }

    // Validate selections
    if (moods.length === 0 || moods.length > 3) {
      return NextResponse.json(
        { success: false, error: 'Please select 1-3 moods' },
        { status: 400 }
      );
    }

    if (styles.length === 0 || styles.length > 2) {
      return NextResponse.json(
        { success: false, error: 'Please select 1-2 music styles' },
        { status: 400 }
      );
    }

    if (instruments.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Please select up to 4 instruments' },
        { status: 400 }
      );
    }

    // Construct ElevenLabs prompt with explicit vocal instructions
    const genderText = vocalGender === 'surprise' 
      ? 'vocals' 
      : `${vocalGender.toUpperCase()} vocals`;
    
    let prompt = `Create a full ${styles.join('-')} song with ${genderText} singing. ${duration} seconds long. Mood: ${moods.join(', ')}.`;
    
    if (instruments.length > 0) {
      prompt += ` Featuring ${instruments.join(', ')}.`;
    }
    
    // If lyrics provided, emphasize they should be sung
    if (lyrics && lyrics.trim()) {
      prompt += ` The vocals should sing these lyrics:\n\n${lyrics.trim()}`;
    } else {
      prompt += ` Include clear lead vocal melody, verses, and chorus with meaningful lyrics.`;
    }

    // Call ElevenLabs Music API with vocal parameters
    console.log('🎵 [API] Generating music with ElevenLabs...');
    console.log('🎵 [API] Prompt:', prompt);
    
    const requestBody = {
      prompt: prompt,
      force_instrumental: false,  // ✅ Enable vocals
      include_vocals: true,       // ✅ Explicitly request vocals
      model_id: 'music_v1',       // ✅ Use v1 which supports vocals
    };
    
    console.log('🎵 [API] Request body:', requestBody);
    
    const response = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🎵 [API] Music generation response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🎵 [API] Error response:', errorData);
      throw new Error(errorData.detail?.message || errorData.detail || 'Failed to generate music');
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    
    console.log('🎵 [API] Audio generated successfully! Size:', audioBuffer.byteLength, 'bytes');

    return NextResponse.json({
      success: true,
      audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      creditsUsed: Math.ceil(duration / 30),
      modelUsed: 'elevenlabs-music-v1',
      duration,
      prompt,
    });
  } catch (error: any) {
    console.error('Error generating music:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate music',
      },
      { status: 500 }
    );
  }
}
