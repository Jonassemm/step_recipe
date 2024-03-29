'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as cheerio from 'cheerio';
import Instruction from './components/Instruction';

interface RecipeResult {
  recipe: string;
  ingredients: Array<string>;
  error?: string;
}

export default function Home() {
  const [recipeLink, setRecipeLink] = useState('');
  const [recipeInstructions, setRecipeInstructions] = useState(Array<string>);
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadedRecipe, setLoadedRecipe] = useState(false);
  const [error, setError] = useState(String);
  const myRef = useRef<null | HTMLDivElement>(null);

  const processSteps = (stepsString: string) => {
    const cheerioAPI = cheerio.load(stepsString);
    let steps: Array<string> = [];
    cheerioAPI('step').each((i, el) => {
      const step = cheerioAPI(el).html();
      if (step) steps.push(step);
    });
    setRecipeInstructions(steps);
  };

  const handleGenerateInstructions = async () => {
    setLoading(true);
    setLoadedRecipe(false);
    setError('');
    setRecipeInstructions([]);

    try {
      let fetchRecipe = await fetch('/api/recipe', {
        method: 'POST',
        body: JSON.stringify({ url: recipeLink, amount: amount }),
      });
      let recipeResult: RecipeResult = await fetchRecipe.json();
      setLoadedRecipe(true);

      let fetchSteps = await fetch('/api/instructions', {
        method: 'POST',
        body: JSON.stringify({
          recipe: recipeResult.recipe,
          ingredients: recipeResult.ingredients,
        }),
      });

      let stepsResult = await fetchSteps.text();
      if (stepsResult) processSteps(stepsResult);
    } catch (err: any) {
      console.error(err.message);
      setError('Anleitung konnte nicht generiert werden');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (myRef.current) myRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [recipeInstructions]);

  return (
    <main className="flex min-h-full container mx-auto flex-col items-center p-6 pt-14 sm:p-24 ">
      <h1 className="text-5xl sm:text-6xl font-bold text-center">
        Schritt für Schritt
      </h1>
      <h2 className="text-xl sm:text-3xl mt-3 text-center text-gray-600">
        Jedes <b>Chefkoch.de</b> Rezept als einfache Schritt für Schritt
        Anleitung
      </h2>
      <div className="flex flex-col grow w-full ">
        <div
          className={
            'flex flex-col w-full md:flex-row transition-all items-center gap-2 mt-8 sm:mt-14' +
            (!loading && !(recipeInstructions.length > 0) ? ' sm:mt-40' : '')
          }
        >
          <div className="flex flex-col w-full">
            <label htmlFor="recipeLink" className="text-sm pb-1 text-gray-500">
              Chefkoch Link
            </label>
            <input
              id="recipeLink"
              type="text"
              value={recipeLink}
              onChange={(e) => setRecipeLink(e.target.value)}
              placeholder="Chefkoch Rezeptlink eingeben"
              className="px-4 w-full sm:min-w-[400px] h-14 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex flex-col w-full md:w-fit">
            <label htmlFor="amount" className="text-sm pb-1 text-gray-500">
              Portionen
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              max={100}
              min={1}
              onChange={(e) => {
                let value = parseInt(e.target.value);
                if (value > 100) setAmount(100);
                else if (value < 1) setAmount(1);
                else setAmount(value);
              }}
              className="px-4 h-14 border border-gray-300 rounded-md"
            />
          </div>
          <button
            disabled={loading}
            onClick={handleGenerateInstructions}
            className="self-end mt-4 sm:mt-0 w-full sm:w-fit leading-none h-14 px-4 py-2 bg-primary hover:bg-green-900 text-white rounded-md"
          >
            Anleitung generieren
          </button>
        </div>
        {loading && (
          <div className="flex flex-col pt-14 items-center">
            <svg
              className="animate-spin w-14 h-14"
              width="800px"
              height="800px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.2"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                fill="#000000"
              />
              <path
                d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z"
                fill="#000000"
              />
            </svg>
            <span className="text-gray-600 mt-4">
              {loadedRecipe ? 'Erstelle Anleitung...' : 'Suche Rezept...'}
            </span>
            {loadedRecipe && (
              <span className="text-gray-600 mt-2 text-sm">
                Dies kann bis zu 1 Minute dauern
              </span>
            )}
          </div>
        )}
        {error && (
          <div className="bg-red-400 rounded-lg p-4 mt-10 text-red-900 w-fit">
            {error}
          </div>
        )}
        {recipeInstructions.length > 0 && (
          <div
            ref={myRef}
            className="pt-8 mt-8 border-gray-300 border-t  container"
          >
            <h2 className="text-4xl text-center font-bold mb-4">
              Deine Anleitung
            </h2>
            <ul>
              {recipeInstructions.map((instruction, index) => {
                return (
                  <Instruction key={index} idx={index} text={instruction} />
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
