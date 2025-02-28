import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { addRecipe } from '../services/recipeService';
import { Recipe } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateRecipe: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (!currentUser) {
      toast.error('You must be logged in to create a recipe');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      // Add the user ID to the recipe data
      const recipeWithUser = {
        ...data,
        userId: currentUser.uid
      };
      
      const recipeId = await addRecipe(recipeWithUser);
      toast.success('Recipe created successfully!');
      navigate(`/recipe/${recipeId}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.error('Failed to create recipe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Recipe</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <RecipeForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CreateRecipe;