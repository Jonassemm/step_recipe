import axios from 'axios';
import * as cheerio from 'cheerio';

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
      error: error,
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
        if (ingredientString.length > 0) ingredient += ' ';
        ingredient += ingredientString;
      });
    ingredients.push(ingredient);
  });

  let recipe = cheerioAPI('[data-vars-tracking-title="Zubereitung"]')
    .parent()
    .find('.ds-box')
    .first()
    .text()
    .trim();

  //remove all line breaks
  recipe = recipe.replace(/\r?\n|\r/g, ' ');

  if (!recipe || ingredients.length == 0) {
    return Response.json({
      error: 'Invalid Recipe',
    });
  }

  return Response.json({
    ingredients: ingredients,
    recipe: recipe,
  });
}
