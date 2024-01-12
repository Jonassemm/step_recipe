import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { config } from '../../../config';

export async function POST(request: Request) {
  // Extract the recipe ID from the request body
  const requestBody = await request.json();
  const url = requestBody.url;
  const amount = requestBody.amount || null;

  //test if url is valid and of a chefkoch recipe
  const regex = /https:\/\/www.chefkoch.de\/rezepte\/(\d+)/;
  let match_url = url.match(regex) || [];
  match_url = match_url[0];
  if (!url || !match_url) {
    return Response.json({
      error: 'Invalid URL',
    });
  }
  if (amount) {
    match_url += '?portionen=' + amount;
  }

  // Fetch the recipe page
  let pageResult;
  try {
    pageResult = (await axios.get(match_url)).data;
  } catch (error) {
    return Response.json({
      error: 'Could not fetch recipe',
    });
  }
  const cheerioAPI = cheerio.load(pageResult);

  // Extract the ingredients and recipe
  let ingredients: Array<string> = [];
  cheerioAPI('table.ingredients > tbody > tr').each((i, element) => {
    let ingredient = '';
    cheerioAPI(element)
      .find('td > span')
      .each((i, element) => {
        let ingredientString = cheerioAPI(element).text().trim();
        ingredientString = ingredientString.replace(/\s\s+/g, ' ');
        ingredient += ingredientString + ' ';
      });
    ingredients.push(ingredient);
  });

  const ingredientsString = 'Ingredients: {' + ingredients.join('; ') + '}';

  let recipe = cheerioAPI('[data-vars-tracking-title="Zubereitung"]')
    .parent()
    .find('.ds-box')
    .first()
    .text()
    .trim();

  //remove all line breaks
  recipe = recipe.replace(/\r?\n|\r/g, ' ');

  if (!recipe || !ingredientsString) {
    return Response.json({
      error: 'Invalid Recipe',
    });
  }

  const openai = new OpenAI({
    apiKey: config.OPENAI_KEY,
  });

  let userMessage = `Give a detailed step by step instruction how to cook this recipe. Include exact measurements of ingredients in instructions.  Ignore anything that is not a cooking instruction. Don't omit any measurements. Direct answer in markup with this exact format: <step>Chop <b>1</b> onion</step>. Answer in german. ${ingredientsString} Recipe: {${recipe}}`;

  let chatResponse;
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        {
          role: 'system',
          content:
            'You are a cooking assistant helping a user with a precise step by step instruction on how to cook a meal. All measurements are included in the steps. Your answer in markup format. Example: <step>Chop <b>1</b> onion</step>',
        },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1000,
    });

    chatResponse = chatCompletion.choices[0].message.content;
  } catch (error) {
    return Response.json({
      error: 'OpenAI Error',
    });
  }

  //return recipe
  return Response.json({
    stepByStepRecipe: chatResponse,
  });
}
