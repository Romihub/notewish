import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
  console.log('🎬 [VIDEO API] Request received.');
  console.log('🎬 [VIDEO API] Checking environment variables...');
  console.log(`  - REPLICATE_API_TOKEN: ${REPLICATE_API_TOKEN ? 'Loaded' : 'NOT LOADED'}`);
  console.log(`  - GOOGLE_VEO_API_KEY: ${GOOGLE_VEO_API_KEY ? 'Loaded' : 'NOT LOADED'}`);
  console.log(`  - FREEPIK_API_KEY: ${FREEPIK_API_KEY ? 'Loaded' : 'NOT LOADED'}`);

  try {
    const {
      description,
      style = 'realistic',
      cameraMovement = 'static',
      duration = 5,
      motionSpeed = 1.0,
      referenceImage = null,
      aspectRatio = '16:9',
      resolution = '1080p',
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

    // If reference image is provided, explicitly mention it in the prompt
    const imageContext = referenceImage 
      ? 'Animate the provided image to life. ' 
      : '';

    const enhancedPrompt = `${imageContext}${description}. ${styleText}. ${cameraText}. ${motionText}. High quality, professional composition.`;

    // Try providers in order of priority
    let result = null;
    let usedProvider = '';

    // 1. Try Replicate (Google Veo 3.1)
    if ((provider === 'auto' || provider === 'replicate') && REPLICATE_API_TOKEN) {
      console.log('🎬 [VIDEO API] Attempting to generate with Replicate (Google Veo 3.1)...');
      try {
        result = await generateWithReplicateVeo(enhancedPrompt, duration, referenceImage, aspectRatio);
        usedProvider = 'replicate-google-veo-3.1';
        console.log('🎬 [VIDEO API] ✅ Success with Replicate (Google Veo 3.1).');
      } catch (error: any) {
        console.error('🎬 [VIDEO API] ❌ Replicate (Google Veo 3.1) failed:', error.message);
      }
    }

    // 2. Try Replicate (Kling v2.1)
    if (!result && (provider === 'auto' || provider === 'replicate') && REPLICATE_API_TOKEN) {
      console.log('🎬 [VIDEO API] Attempting to generate with Replicate (Kling v2.1)...');
      try {
        result = await generateWithKling(enhancedPrompt, duration, referenceImage);
        usedProvider = 'replicate-kling-v2.1';
        console.log('🎬 [VIDEO API] ✅ Success with Replicate (Kling v2.1).');
      } catch (error: any) {
        console.error('🎬 [VIDEO API] ❌ Replicate (Kling v2.1) failed:', error.message);
      }
    }

    // 3. Try Google Veo3 (Direct API)
    if (!result && (provider === 'auto' || provider === 'veo') && GOOGLE_VEO_API_KEY) {
      console.log('🎬 [VIDEO API] Attempting to generate with Google Veo3...');
      try {
        result = await generateWithVeo3(enhancedPrompt, duration);
        usedProvider = 'google-veo3';
        console.log('🎬 [VIDEO API] ✅ Success with Google Veo3.');
      } catch (error: any) {
        console.error('🎬 [VIDEO API] ❌ Google Veo3 failed:', error.message);
      }
    }

    // 4. Try Replicate (Sora 2) as a fallback
    if (!result && (provider === 'auto' || provider === 'replicate') && REPLICATE_API_TOKEN) {
      console.log('🎬 [VIDEO API] Attempting to generate with Replicate (Sora 2)...');
      try {
        result = await generateWithSora2(enhancedPrompt, duration, referenceImage, aspectRatio, resolution);
        usedProvider = 'replicate-sora-2';
        console.log('🎬 [VIDEO API] ✅ Success with Replicate (Sora 2).');
      } catch (error: any) {
        console.error('🎬 [VIDEO API] ❌ Replicate (Sora 2) failed:', error.message);
      }
    }

    // 5. Try Freepik (Minimax Hailuo)
    if (!result && (provider === 'auto' || provider === 'freepik') && FREEPIK_API_KEY) {
      console.log('🎬 [VIDEO API] Attempting to generate with Freepik...');
      try {
        result = await generateWithFreepik(enhancedPrompt, duration, referenceImage);
        usedProvider = 'freepik-minimax-hailuo';
        console.log('🎬 [VIDEO API] ✅ Success with Freepik.');
      } catch (error: any) {
        console.error('🎬 [VIDEO API] ❌ Freepik failed:', error.message);
      }
    }

    // 6. Try Replicate (Wan 2.2) as a fallback
    if (!result && (provider === 'auto' || provider === 'replicate') && REPLICATE_API_TOKEN) {
      console.log('🎬 [VIDEO API] Attempting to generate with Replicate (Wan 2.2)...');
      try {
        result = await generateWithReplicate(enhancedPrompt, duration, referenceImage);
        usedProvider = 'replicate-wan-2.2';
        console.log('🎬 [VIDEO API] ✅ Success with Replicate (Wan 2.2).');
      } catch (error: any) {
        console.error('🎬 [VIDEO API] ❌ Replicate (Wan 2.2) failed:', error.message);
      }
    }

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'No video generation API configured. Please add GOOGLE_VEO_API_KEY, FREEPIK_API_KEY, or REPLICATE_API_TOKEN to your .env file.',
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
  const url = `https://generativelanguage.googleapis.com/v1/models/veo-3:generate?key=${GOOGLE_VEO_API_KEY}`;
  const requestBody = {
    prompt,
    duration,
  };

  console.log('🎬 [VEO3] Sending request to:', url);
  console.log('🎬 [VEO3] Request body:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('🎬 [VEO3] API Error Response:', errorBody);
    throw new Error(`Veo3 API request failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  console.log('🎬 [VEO3] API Success Response:', JSON.stringify(data, null, 2));
  
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

// Replicate Sora 2 implementation
async function generateWithSora2(
  prompt: string, 
  duration: number, 
  referenceImage: string | null,
  aspectRatio: string = '16:9',
  resolution: string = '1080p'
) {
  // Build the input object
  const input: any = {
    prompt: prompt,
  };

  // Add duration - Sora 2 uses "seconds" not "duration"
  if (duration) {
    input.seconds = duration;
  }

  // Add reference image - Sora 2 uses "input_reference" not "image"
  if (referenceImage) {
    input.input_reference = referenceImage;
  }

  // Convert aspect ratio to Sora 2 format (landscape/portrait)
  if (aspectRatio) {
    // Map common aspect ratios to landscape/portrait
    const aspectRatioMap: Record<string, string> = {
      '16:9': 'landscape',
      '4:3': 'landscape',
      '1:1': 'landscape', // Default to landscape for square
      '9:16': 'portrait',
      '3:4': 'portrait',
    };
    input.aspect_ratio = aspectRatioMap[aspectRatio] || 'landscape';
  }

  // Note: Sora 2 may not support custom resolution parameter
  // The resolution is determined by the aspect ratio

  console.log('🎬 [SORA2] Input parameters:', JSON.stringify({
    ...input,
    input_reference: input.input_reference ? '[base64 data]' : null
  }, null, 2));

  const output = await replicate.run(
    "openai/sora-2", // Using the Sora 2 model
    { input }
  );

  // The output format from Replicate can vary. We need to handle it robustly.
  console.log('🎬 [SORA2] Raw output received:', JSON.stringify(output, null, 2));
  let videoUrl: string | null = null;

  if (output && typeof output === 'object') {
    try {
      // Try toString() first (works for FileOutput objects)
      if (typeof (output as any).toString === 'function') {
        const urlString = String(output);
        if (urlString.startsWith('http')) {
          videoUrl = urlString;
          console.log('🎬 [SORA2] Extracted via toString():', videoUrl.slice(0, 80));
        }
      }
      
      // Try array format
      if (!videoUrl && Array.isArray(output) && output.length > 0) {
        const firstItem = output[0];
        if (typeof firstItem === 'string') {
          videoUrl = firstItem;
        } else if (firstItem && typeof firstItem === 'object') {
          if (typeof (firstItem as any).toString === 'function') {
            const itemString = String(firstItem);
            if (itemString.startsWith('http')) {
              videoUrl = itemString;
            }
          }
        }
        if (videoUrl) {
          console.log('🎬 [SORA2] Extracted from array:', videoUrl.slice(0, 80));
        }
      }
      
      // Try url property
      if (!videoUrl && 'url' in output) {
        const urlValue = typeof (output as any).url === 'function' ? await (output as any).url() : (output as any).url;
        if (typeof urlValue === 'string') {
          videoUrl = urlValue;
          console.log('🎬 [SORA2] Extracted from url property:', urlValue.slice(0, 80));
        }
      }
    } catch (e) {
      console.error('🎬 [SORA2] Error parsing Replicate output:', e);
    }
  } else if (typeof output === 'string') {
    videoUrl = output;
    console.log('🎬 [SORA2] Direct string:', String(output).substring(0, 80));
  }

  if (!videoUrl) {
    console.error('🎬 [SORA2] Returned an unexpected output format:', output);
    throw new Error('Failed to get video URL from Sora 2');
  }

  console.log('🎬 [SORA2] ✅ Success! Video URL:', videoUrl.substring(0, 100));
  return {
    videoUrl,
    status: 'succeeded',
  };
}

// Replicate Google Veo 3.1 implementation
async function generateWithReplicateVeo(
  prompt: string,
  duration: number,
  referenceImage: string | null,
  aspectRatio: string = '16:9'
) {
  const input: any = {
    prompt: prompt,
    duration: duration,
    generate_audio: true, // As per the sample request
  };

  if (referenceImage) {
    // Veo 3.1 expects an array of reference images
    input.reference_images = [referenceImage];
  }

  const aspectRatioMap: Record<string, string> = {
    '16:9': '16:9',
    '4:3': '4:3',
    '1:1': '1:1',
    '9:16': '9:16',
    '3:4': '3:4',
  };
  input.aspect_ratio = aspectRatioMap[aspectRatio] || '16:9';

  console.log('🎬 [REPLICATE-VEO] Input parameters:', JSON.stringify({
    ...input,
    reference_images: input.reference_images ? ['[base64 data]'] : null
  }, null, 2));

  const output = await replicate.run(
    "google/veo-3.1",
    { input }
  );

  // Using the proven robust URL extraction logic from Sora 2
  console.log('🎬 [REPLICATE-VEO] Raw output received:', JSON.stringify(output, null, 2));
  let videoUrl: string | null = null;

  if (output && typeof output === 'object') {
    try {
      if (typeof (output as any).toString === 'function') {
        const urlString = String(output);
        if (urlString.startsWith('http')) {
          videoUrl = urlString;
        }
      }
      if (!videoUrl && Array.isArray(output) && output.length > 0) {
        const firstItem = output[0];
        if (typeof firstItem === 'string') {
          videoUrl = firstItem;
        } else if (firstItem && typeof firstItem === 'object' && typeof (firstItem as any).toString === 'function') {
          const itemString = String(firstItem);
          if (itemString.startsWith('http')) videoUrl = itemString;
        }
      }
      if (!videoUrl && 'url' in output) {
        const urlValue = typeof (output as any).url === 'function' ? await (output as any).url() : (output as any).url;
        if (typeof urlValue === 'string') videoUrl = urlValue;
      }
    } catch (e) {
      console.error('🎬 [REPLICATE-VEO] Error parsing Replicate output:', e);
    }
  } else if (typeof output === 'string') {
    videoUrl = output;
  }

  if (!videoUrl) {
    console.error('🎬 [REPLICATE-VEO] Returned an unexpected output format:', output);
    throw new Error('Failed to get video URL from Replicate Veo 3.1');
  }

  console.log('🎬 [REPLICATE-VEO] ✅ Success! Video URL:', videoUrl.substring(0, 100));
  return {
    videoUrl,
    status: 'succeeded',
  };
}

// Replicate Kling v2.1 implementation
async function generateWithKling(
  prompt: string,
  duration: number,
  referenceImage: string | null
) {
  const input: any = {
    prompt: prompt,
    duration: duration,
    mode: 'standard',
  };

  if (referenceImage) {
    input.start_image = referenceImage;
  }

  console.log('🎬 [KLING] Input parameters:', JSON.stringify({
    ...input,
    start_image: input.start_image ? '[base64 data]' : null
  }, null, 2));

  const output = await replicate.run(
    "kwaivgi/kling-v2.1",
    { input }
  );

  // Robust URL extraction
  console.log('🎬 [KLING] Raw output received:', JSON.stringify(output, null, 2));
  let videoUrl: string | null = null;

  if (output && typeof output === 'object' && Array.isArray(output) && output.length > 0) {
    videoUrl = output[0];
  } else if (typeof output === 'string') {
    videoUrl = output;
  }

  if (!videoUrl || typeof videoUrl !== 'string') {
    console.error('🎬 [KLING] Returned an unexpected output format:', output);
    throw new Error('Failed to get video URL from Kling v2.1');
  }

  console.log('🎬 [KLING] ✅ Success! Video URL:', videoUrl.substring(0, 100));
  return {
    videoUrl,
    status: 'succeeded',
  };
}

// Replicate Wan 2.2 implementation (fallback)
async function generateWithReplicate(
  prompt: string, 
  duration: number, 
  referenceImage: string | null
) {
  // This function is now a fallback and can be updated or removed
  // For now, we'll keep it pointing to Sora 2 as well
  return generateWithSora2(prompt, duration, referenceImage, '16:9', '1080p');
}
