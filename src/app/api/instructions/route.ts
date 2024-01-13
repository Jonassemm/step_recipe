import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: Request) {
  const requestBody = await request.json();
  const ingredients = requestBody.ingredients;
  const recipe = requestBody.recipe;

  if (
    !ingredients ||
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    !recipe ||
    typeof recipe !== 'string'
  ) {
    return NextResponse.json(
      {
        error: 'Invalid request body',
      },
      {
        status: 500,
      }
    );
  }

  const ingredientsString = 'Ingredients: {' + ingredients.join('; ') + '}';
  let userMessage = `${ingredientsString}; Recipe: {${recipe}} Include exact measurements of every ingredient in instructions. Direct answer in markup with this exact format: <step>Chop <b>1</b> onion</step>. Answer in german.`;

  let chatCompletionStream;
  try {
    chatCompletionStream = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a cooking assistant helping a user with a precise step by step instruction on how to cook a meal. All measurements are included in the steps. Your answer in markup format. Example: <step>Chop <b>1</b> onion</step>',
        },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1000,
      temperature: 0.1,
      stream: true,
    });

    const stream = OpenAIStream(chatCompletionStream, {
      async onCompletion(completion) {},
    });
    return new StreamingTextResponse(stream);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'OpenAI Error',
      },
      {
        status: 500,
      }
    );
  }
}
