'use client';

import React, { use, useState, useEffect } from 'react';
import * as cheerio from 'cheerio';
import Instruction from './components/Instruction';

interface RecipeResult {
  recipe: string;
  ingredients: Array<string>;
  error?: string;
}

interface StepResults {
  steps: Array<string>;
  error?: string;
}

export default function Home() {
  const [recipeLink, setRecipeLink] = useState('');
  const [recipeInstructions, setRecipeInstructions] = useState(Array<string>);
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(String);

  const handleGenerateInstructions = async () => {
    setLoading(true);
    setError('');
    setRecipeInstructions([]);

    try {
      let fetchRecipe = await fetch('/api/recipe', {
        method: 'POST',
        body: JSON.stringify({ url: recipeLink, amount: amount }),
      });
      let recipeResult: RecipeResult = await fetchRecipe.json();
      console.log(recipeResult);
      if (recipeResult.error) throw new Error(recipeResult.error);

      let fetchSteps = await fetch('/api/instructions', {
        method: 'POST',
        body: JSON.stringify({
          recipe: recipeResult.recipe,
          ingredients: recipeResult.ingredients,
        }),
      });
      let stepsResult: StepResults = await fetchSteps.json();
      if (stepsResult.error) throw new Error(stepsResult.error);
      console.log(stepsResult.steps);

      if (stepsResult.steps.length > 0)
        setRecipeInstructions(stepsResult.steps);
    } catch (err: any) {
      console.error(err.message);
      setError('Anleitung konnte nicht generiert werden');
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-[#FAFAF8]">
      <h1 className="text-6xl font-bold">Schritt für Schritt</h1>
      <h2 className="text-3xl mt-3 text-gray-500">
        Jedes Chefkoch Rezept als konkrete Schritt-für-Schritt Anleitung
      </h2>
      <div className="flex items-center gap-2 mt-14 ">
        <div className="flex flex-col">
          <label htmlFor="recipeLink" className="text-sm pb-1 text-gray-500">
            Chefkoch Link
          </label>
          <input
            id="recipeLink"
            type="text"
            value={recipeLink}
            onChange={(e) => setRecipeLink(e.target.value)}
            placeholder="Chefkoch Rezeptlink eingeben"
            className="px-4 min-w-[400px] h-14 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex flex-col">
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
          className="self-end leading-none h-14 px-4 py-2 bg-[#3B8047] hover:bg-green-900 text-white rounded-md"
        >
          Anleitung generieren
        </button>
      </div>
      {loading && (
        <div className="flex pt-14 items-center">
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
        </div>
      )}
      {error && (
        <div className="bg-red-400 rounded-lg p-4 mt-10 text-red-900 w-fit">
          {error}
        </div>
      )}
      {recipeInstructions.length > 0 && (
        <div className="mt-8 container">
          <ul>
            {recipeInstructions.map((instruction, index) => {
              return <Instruction key={index} idx={index} text={instruction} />;
            })}
          </ul>
        </div>
      )}
    </main>
  );
}
