import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { occasion, recipientName, personalMessage, style, tone, length } = await request.json();

    // Build the prompt based on user inputs
    const prompt = `Create a ${length} ${style} message with a ${tone} tone for ${occasion}${recipientName ? ` for ${recipientName}` : ''}.
    
${personalMessage ? `Personal context: ${personalMessage}` : ''}

Requirements:
- Style: ${style}
- Tone: ${tone}
- Length: ${length}
- Make it heartfelt and genuine
- No generic phrases

Generate ONLY the message text, no explanations.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional greeting card writer who creates authentic, heartfelt messages.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: length === 'short' ? 100 : length === 'medium' ? 200 : 400,
    });

    const generatedMessage = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      message: generatedMessage,
      creditsUsed: 1,
      modelUsed: 'gpt-4',
    });
  } catch (error: any) {
    console.error('Error generating message:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate message',
      },
      { status: 500 }
    );
  }
}
