import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import Replicate from 'replicate';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger image uploads
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const { description, style, aspectRatio, quality = 'standard', referenceImage } = await request.json();

    console.log('🎨 [IMAGE API] Request:', { description: description?.substring(0, 100), style, aspectRatio, hasReference: !!referenceImage });

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    // If reference image provided, use Replicate FLUX for image-to-image
    if (referenceImage) {
      console.log('🎨 [IMAGE API] Using Replicate FLUX (image-to-image)');
      return await generateWithReplicate(description, style, aspectRatio, referenceImage);
    }

    // Otherwise, use DALL-E 3 for text-to-image
    console.log('🎨 [IMAGE API] Using DALL-E 3 (text-to-image)');
    return await generateWithDallE(description, style, aspectRatio, quality);
  } catch (error: any) {
    console.error('🎨 [IMAGE API] ❌ Top-level error:', error);
    console.error('🎨 [IMAGE API] Error stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}

// DALL-E 3 - Text to Image
async function generateWithDallE(
  description: string,
  style: string,
  aspectRatio: string,
  quality: string
) {
  try {
    console.log('🎨 [DALL-E] Starting generation...');

    // Build the enhanced prompt based on style and description
    const stylePrompts: Record<string, string> = {
      'vibrant': 'vibrant and colorful, high saturation',
      'watercolor': 'watercolor painting style, soft edges, flowing colors',
      'photorealistic': 'photorealistic, highly detailed, professional photography',
      'cartoon': 'cartoon style, bold outlines, playful and fun',
      'anime': 'anime/manga art style, expressive eyes, dynamic composition',
      '3d': '3D rendered, smooth surfaces, cinematic lighting',
      'oil': 'oil painting style, rich textures, classical art',
      'sketch': 'pencil sketch style, hand-drawn, artistic linework',
    };

    const styleModifier = style && stylePrompts[style.toLowerCase()] 
      ? `, ${stylePrompts[style.toLowerCase()]}` 
      : '';

    const enhancedPrompt = `${description}${styleModifier}. High quality, professional composition, beautiful lighting.`;
    
    console.log('🎨 [DALL-E] Enhanced prompt:', enhancedPrompt.substring(0, 150));

    // Determine size based on aspect ratio
    const sizeMap: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '4:3': '1792x1024',
      '9:16': '1024x1792',
      '3:4': '1024x1792',
    };

    const size = aspectRatio && sizeMap[aspectRatio] ? sizeMap[aspectRatio] : '1024x1024';
    
    console.log('🎨 [DALL-E] Calling API with size:', size, 'quality:', quality);

    // Call DALL-E 3 API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      quality: quality as 'standard' | 'hd',
      style: 'vivid',
    });

    const imageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    console.log('🎨 [DALL-E] Response received');
    console.log('🎨 [DALL-E] Image URL:', imageUrl?.substring(0, 80) + '...');
    console.log('🎨 [DALL-E] Revised prompt:', revisedPrompt?.substring(0, 100));

    if (!imageUrl) {
      console.error('🎨 [DALL-E] ❌ No image URL in response');
      throw new Error('No image URL returned from DALL-E');
    }

    console.log('🎨 [DALL-E] ✅ Success!');
    return NextResponse.json({
      success: true,
      imageUrl,
      revisedPrompt,
      creditsUsed: quality === 'hd' ? 2 : 1,
      modelUsed: 'dall-e-3',
    });
  } catch (error: any) {
    console.error('🎨 [DALL-E] ❌ Error:', error);
    console.error('🎨 [DALL-E] Error message:', error.message);
    console.error('🎨 [DALL-E] Error stack:', error.stack);
    throw new Error(`DALL-E 3 error: ${error.message}`);
  }
}

// Replicate with fallback models - Image to Image
async function generateWithReplicate(
  description: string,
  style: string,
  aspectRatio: string,
  referenceImage: string
) {
  // Build the enhanced prompt based on style
  const stylePrompts: Record<string, string> = {
    'vibrant': 'vibrant and colorful, high saturation',
    'watercolor': 'watercolor painting style, soft edges, flowing colors',
    'photorealistic': 'photorealistic, highly detailed, professional photography',
    'cartoon': 'cartoon style, bold outlines, playful and fun',
    'anime': 'anime/manga art style, expressive eyes, dynamic composition',
    '3d': '3D rendered, smooth surfaces, cinematic lighting',
    'oil': 'oil painting style, rich textures, classical art',
    'sketch': 'pencil sketch style, hand-drawn, artistic linework',
  };

  const styleModifier = style && stylePrompts[style.toLowerCase()] 
    ? `, ${stylePrompts[style.toLowerCase()]}` 
    : '';

  const enhancedPrompt = `${description}${styleModifier}. High quality, professional composition, beautiful lighting.`;
  console.log('🎨 [REPLICATE] Enhanced prompt:', enhancedPrompt.substring(0, 150));

  // Map aspect ratios
  const aspectRatioMap: Record<string, string> = {
    '1:1': '1:1',
    '16:9': '16:9',
    '4:3': '4:3',
    '9:16': '9:16',
    '3:4': '3:4',
  };

  const replicateAspectRatio = aspectRatio && aspectRatioMap[aspectRatio] 
    ? aspectRatioMap[aspectRatio] 
    : '1:1';

  const USE_FALLBACK = true;
  
  // Define fallback models with priority order (verified working models)
  const models = [
    {
      name: 'google/nano-banana',
      priority: 1,
      config: {
        prompt: enhancedPrompt,
        image_input: [referenceImage],
        aspect_ratio: replicateAspectRatio === '1:1' ? 'match_input_image' : replicateAspectRatio,
        output_format: 'png',
      }
    },
    {
      name: 'stability-ai/stable-diffusion-img2img',
      priority: 2,
      config: {
        prompt: enhancedPrompt,
        image: referenceImage,
        strength: 0.8,
      }
    },
    {
      name: 'timothybrooks/instruct-pix2pix',
      priority: 3,
      config: {
        prompt: enhancedPrompt,
        image: referenceImage,
        num_inference_steps: 20,
      }
    },
    {
      name: 'jagilley/controlnet-canny',
      priority: 4,
      config: {
        prompt: enhancedPrompt,
        image: referenceImage,
        num_samples: 1,
      }
    },
  ];

  // Filter to only nano-banana if fallback is disabled
  const modelsToTry = USE_FALLBACK ? models : [models[0]];
  let lastError: Error | null = null;
  
  for (const model of modelsToTry) {
    try {
      console.log(`🎨 [REPLICATE] Trying model ${model.priority}/4: ${model.name}...`);
      console.log(`🎨 [REPLICATE] Config:`, JSON.stringify({ ...model.config, image_input: model.config.image_input ? ['[base64...]'] : undefined }).substring(0, 200));
      console.log(`🎨 [REPLICATE] Calling replicate.run()...`);
      
      const output = await replicate.run(model.name as any, { input: model.config });

      console.log(`🎨 [REPLICATE] ${model.name} - Received output!`);
      console.log(`🎨 [REPLICATE] ${model.name} output type:`, typeof output);
      console.log(`🎨 [REPLICATE] ${model.name} output keys:`, output && typeof output === 'object' ? Object.keys(output) : 'N/A');
      console.log(`🎨 [REPLICATE] ${model.name} output toString():`, output && typeof output === 'object' && typeof (output as any).toString === 'function' ? String(output) : 'N/A');
      console.log(`🎨 [REPLICATE] ${model.name} output JSON:`, JSON.stringify(output).substring(0, 300));
      
      // Extract image URL from various output formats
      let imageUrl: string | null = null;
      
      // nano-banana returns a FileOutput object with toString() method
      if (output && typeof output === 'object') {
        try {
          // Try .toString() first (works for nano-banana FileOutput)
          if (typeof (output as any).toString === 'function') {
            const urlString = String(output);
            if (urlString.startsWith('http')) {
              imageUrl = urlString;
              console.log(`🎨 [REPLICATE] Extracted via toString():`, imageUrl.slice(0, 80));
            }
          }
          
          // Fallback to other methods if toString didn't work
          if (!imageUrl && typeof (output as any).url === 'function') {
            imageUrl = await (output as any).url();
            console.log(`🎨 [REPLICATE] Extracted via url() method:`, imageUrl ? String(imageUrl).slice(0, 80) : 'null');
          } else if (!imageUrl && 'url' in output && typeof (output as any).url === 'string') {
            imageUrl = (output as any).url;
            console.log(`🎨 [REPLICATE] Extracted from url property:`, imageUrl ? String(imageUrl).slice(0, 80) : 'null');
          } else if (!imageUrl && Array.isArray(output) && output.length > 0) {
            // Handle array output
            const firstItem = output[0];
            if (typeof firstItem === 'string') {
              imageUrl = firstItem;
            } else if (firstItem && typeof firstItem === 'object') {
              // Try toString on array item
              if (typeof (firstItem as any).toString === 'function') {
                const itemString = String(firstItem);
                if (itemString.startsWith('http')) {
                  imageUrl = itemString;
                }
              } else if ('url' in firstItem) {
                imageUrl = typeof firstItem.url === 'function' ? await firstItem.url() : firstItem.url;
              }
            }
            console.log(`🎨 [REPLICATE] Extracted from array:`, imageUrl ? String(imageUrl).slice(0, 80) : 'null');
          }
        } catch (urlError: any) {
          console.error(`🎨 [REPLICATE] Error extracting URL:`, urlError.message);
        }
      } else if (typeof output === 'string') {
        imageUrl = output;
        console.log(`🎨 [REPLICATE] Direct string:`, String(output).slice(0, 80));
      }

      if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        console.log(`🎨 [REPLICATE] ✅ Success with ${model.name}! Image URL:`, imageUrl.substring(0, 100));
        
        return NextResponse.json({
          success: true,
          imageUrl: imageUrl,
          revisedPrompt: enhancedPrompt,
          creditsUsed: 1,
          modelUsed: model.name,
        });
      }
      
      console.warn(`🎨 [REPLICATE] ⚠️ ${model.name} returned invalid URL, trying next model...`);
      lastError = new Error(`${model.name} returned invalid image URL`);
      
    } catch (error: any) {
      console.error(`🎨 [REPLICATE] ❌ ${model.name} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }
  
  // All models failed
  console.error('🎨 [REPLICATE] ❌ All models failed');
  throw new Error(`All Replicate models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}
