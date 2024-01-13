import OpenAI from 'openai';
import * as cheerio from 'cheerio';

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
    return Response.json({
      error: 'Invalid request body',
    });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  const ingredientsString = 'Ingredients: {' + ingredients.join('; ') + '}';
  let userMessage = `${ingredientsString}; Recipe: {${recipe}} Include exact measurements of every ingredient in instructions. Direct answer in markup with this exact format: <step>Chop <b>1</b> onion</step>. Answer in german.`;

  let chatResponse: string;
  try {
    const chatCompletion = await openai.chat.completions.create({
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
    });

    chatResponse = chatCompletion.choices[0].message.content || '';
  } catch (error) {
    return Response.json({
      error: 'OpenAI Error',
    });
  }

  if (!chatResponse) {
    return Response.json({
      error: 'OpenAI Error: No response',
    });
  }

  const cheerioAPI = cheerio.load(chatResponse);
  let steps: Array<string> = [];

  cheerioAPI('step').each((i, el) => {
    const step = cheerioAPI(el).html();
    if (step) steps.push(step);
  });

  if (!steps || steps.length === 0) {
    return Response.json({
      error: 'OpenAI Error: Invalid format',
    });
  }

  //return recipe
  return Response.json({
    steps: steps,
  });
}
