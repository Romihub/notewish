import { NextRequest, NextResponse } from 'next/server';

// Video generation with multiple provider support (in priority order):
// 1. Google Veo3 (GOOGLE_VEO_API_KEY)
// 2. Freepik APIs (FREEPIK_API_KEY):
//    - Seedance Pro 720p
//    - Kling v2.5 Pro
//    - Minimax Hailuo
// 3. Replicate APIs (REPLICATE_API_TOKEN):
//    - Wan 2.2
//    - Hunyuan

const GOOGLE_VEO_API_KEY = process.env.GOOGLE_VEO_API_KEY;
const FREEPIK_API_KEY = process.env.FREEPIK_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const {
      description,
      style = 'realistic',
      cameraMovement = 'static',
      duration = 5,
      motionSpeed = 1.0,
      referenceImage = null,
      provider = 'auto', // 'auto', 'veo', 'freepik', 'replicate'
    } = await request.json();

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    // Build enhanced prompt with style and camera movement
    const styleModifiers: Record<string, string> = {
      'animated': 'animated style, cartoon-like, vibrant colors',
      'realistic': 'photorealistic, cinematic quality, high detail',
      '3d': '3D rendered, smooth surfaces, professional CGI',
      'cinematic': 'cinematic style, dramatic lighting, film quality',
      'abstract': 'abstract art style, artistic interpretation',
      'watercolor': 'watercolor painting style, flowing colors, artistic',
    };

    const cameraModifiers: Record<string, string> = {
      'static': 'static camera, no movement',
      'pan': 'smooth panning camera movement',
      'zoom': 'smooth zoom in/out camera movement',
      'rotate': 'rotating camera movement',
      'dolly': 'dolly camera movement',
      'dynamic': 'dynamic camera movement, cinematic',
    };

    const motionSpeedModifiers: Record<number, string> = {
      0.5: 'slow motion',
      0.75: 'slightly slow motion',
      1.0: 'normal speed',
      1.25: 'slightly fast motion',
      1.5: 'fast motion',
      2.0: 'time-lapse speed',
    };

    const styleText = styleModifiers[style] || styleModifiers['realistic'];
    const cameraText = cameraModifiers[cameraMovement] || cameraModifiers['static'];
    const motionText = motionSpeedModifiers[motionSpeed] || 'normal speed';

    const enhancedPrompt = `${description}. ${styleText}. ${cameraText}. ${motionText}. High quality, professional composition.`;

    // Try providers in order of priority
    let result = null;
    let usedProvider = '';

    // 1. Try Google Veo3 first
    if ((provider === 'auto' || provider === 'veo') && GOOGLE_VEO_API_KEY) {
      try {
        result = await generateWithVeo3(enhancedPrompt, duration);
        usedProvider = 'google-veo3';
      } catch (error: any) {
        console.error('Veo3 failed:', error.message);
      }
    }

    // 2. Try Freepik (Minimax Hailuo)
    if (!result && (provider === 'auto' || provider === 'freepik') && FREEPIK_API_KEY) {
      try {
        result = await generateWithFreepik(enhancedPrompt, duration, referenceImage);
        usedProvider = 'freepik-minimax-hailuo';
      } catch (error: any) {
        console.error('Freepik failed:', error.message);
      }
    }

    // 3. Try Replicate (Wan 2.2)
    if (!result && (provider === 'auto' || provider === 'replicate') && REPLICATE_API_TOKEN) {
      try {
        result = await generateWithReplicate(enhancedPrompt, duration, referenceImage);
        usedProvider = 'replicate-wan-2.2';
      } catch (error: any) {
        console.error('Replicate failed:', error.message);
      }
    }

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'No video generation API configured. Please add GOOGLE_VEO_API_KEY, FREEPIK_API_KEY, or REPLICATE_API_TOKEN to your .env.local file.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
      creditsUsed: Math.ceil(duration / 5) * 2,
      modelUsed: usedProvider,
      duration,
      prompt: enhancedPrompt,
    });
  } catch (error: any) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate video',
      },
      { status: 500 }
    );
  }
}

// Google Veo3 implementation
async function generateWithVeo3(prompt: string, duration: number) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/veo-3:generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GOOGLE_VEO_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      duration,
    }),
  });

  if (!response.ok) {
    throw new Error('Veo3 API request failed');
  }

  const data = await response.json();
  return {
    videoUrl: data.video_url || data.output?.url,
    taskId: data.id,
    status: data.status || 'processing',
  };
}

// Freepik Minimax Hailuo implementation
async function generateWithFreepik(prompt: string, duration: number, referenceImage: string | null) {
  const response = await fetch('https://api.freepik.com/v1/ai/image-to-video/minimax-hailuo-02-1080p', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-freepik-api-key': FREEPIK_API_KEY!,
    },
    body: JSON.stringify({
      prompt,
      prompt_optimizer: true,
      first_frame_image: referenceImage,
      duration: Math.min(duration, 6), // Minimax supports up to 6 seconds
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Freepik API request failed');
  }

  const data = await response.json();
  return {
    videoUrl: data.video_url || data.output?.url,
    taskId: data.id || data.task_id,
    status: data.status || 'processing',
  };
}

// Replicate Wan 2.2 implementation
async function generateWithReplicate(prompt: string, duration: number, referenceImage: string | null) {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify({
      version: 'wan-2.2-version-id', // Replace with actual version ID
      input: {
        prompt,
        duration,
        image: referenceImage,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Replicate API request failed');
  }

  const data = await response.json();
  return {
    videoUrl: data.output?.[0] || data.urls?.get,
    taskId: data.id,
    status: data.status,
  };
}
