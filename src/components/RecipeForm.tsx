import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Minus, Wand2 } from 'lucide-react';
import { Recipe } from '../types';
import { generateRecipe } from '../services/aiService';
import toast from 'react-hot-toast';

interface RecipeFormProps {
  onSubmit: (data: Omit<Recipe, 'id' | 'createdAt'>) => void;
  initialData?: Partial<Recipe>;
  isLoading: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, initialData = {}, isLoading }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<Omit<Recipe, 'id' | 'createdAt'>>({
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      ingredients: initialData.ingredients || [''],
      instructions: initialData.instructions || [''],
      cookingTime: initialData.cookingTime || 30,
      servings: initialData.servings || 2,
      imageUrl: initialData.imageUrl || '',
      userId: initialData.userId || ''
    }
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions'
  });

  const handleGenerateRecipe = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt for the AI');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedRecipe = await generateRecipe(aiPrompt);
      
      setValue('title', generatedRecipe.title);
      setValue('description', generatedRecipe.description);
      
      // Clear existing ingredients and add new ones
      removeIngredient();
      generatedRecipe.ingredients.forEach((ingredient: string, index: number) => {
        appendIngredient(ingredient);
      });
      
      // Clear existing instructions and add new ones
      removeInstruction();
      generatedRecipe.instructions.forEach((instruction: string, index: number) => {
        appendInstruction(instruction);
      });
      
      setValue('cookingTime', generatedRecipe.cookingTime);
      setValue('servings', generatedRecipe.servings);
      
      toast.success('Recipe generated successfully!');
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-orange-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-orange-700 mb-2 flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          Generate Recipe with AI
        </h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="E.g., 'A healthy vegetarian pasta dish with spinach'"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            type="button"
            onClick={handleGenerateRecipe}
            disabled={isGenerating}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Let AI create a recipe for you based on your description.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipe Title*
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            placeholder="E.g., Creamy Garlic Pasta"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL (optional)
          </label>
          <input
            {...register('imageUrl')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description*
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          placeholder="A brief description of your recipe"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cooking Time (minutes)*
          </label>
          <input
            type="number"
            {...register('cookingTime', { 
              required: 'Cooking time is required',
              min: { value: 1, message: 'Cooking time must be at least 1 minute' }
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.cookingTime && <p className="mt-1 text-sm text-red-600">{errors.cookingTime.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Servings*
          </label>
          <input
            type="number"
            {...register('servings', { 
              required: 'Number of servings is required',
              min: { value: 1, message: 'Servings must be at least 1' }
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
          {errors.servings && <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Ingredients*
          </label>
          <button
            type="button"
            onClick={() => appendIngredient('')}
            className="text-orange-500 hover:text-orange-700 flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Ingredient
          </button>
        </div>
        
        {ingredientFields.map((field, index) => (
          <div key={field.id} className="flex mb-2">
            <input
              {...register(`ingredients.${index}` as const, { required: 'Ingredient is required' })}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder={`Ingredient ${index + 1}`}
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Minus className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        {errors.ingredients && <p className="mt-1 text-sm text-red-600">All ingredients are required</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Instructions*
          </label>
          <button
            type="button"
            onClick={() => appendInstruction('')}
            className="text-orange-500 hover:text-orange-700 flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Step
          </button>
        </div>
        
        {instructionFields.map((field, index) => (
          <div key={field.id} className="flex mb-2">
            <textarea
              {...register(`instructions.${index}` as const, { required: 'Instruction is required' })}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder={`Step ${index + 1}`}
              rows={2}
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Minus className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        {errors.instructions && <p className="mt-1 text-sm text-red-600">All instructions are required</p>}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;