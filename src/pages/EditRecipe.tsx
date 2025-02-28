import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { getRecipe, updateRecipe } from '../services/recipeService';
import { Recipe } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      
      try {
        const recipeData = await getRecipe(id);
        setRecipe(recipeData);
        
        // Check if the current user is the owner of the recipe
        if (currentUser && recipeData.userId !== currentUser.uid) {
          toast.error('You do not have permission to edit this recipe');
          navigate(`/recipe/${id}`);
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast.error('Failed to load recipe');
        navigate('/');
      } finally {
        setIsFetching(false);
      }
    };

    fetchRecipe();
  }, [id, currentUser, navigate]);

  const handleSubmit = async (data: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (!id || !recipe) return;
    
    setIsLoading(true);
    try {
      await updateRecipe(id, data);
      toast.success('Recipe updated successfully!');
      navigate(`/recipe/${id}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Failed to update recipe');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="text-orange-500 hover:text-orange-600"
        >
          Return to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Recipe</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <RecipeForm 
          onSubmit={handleSubmit} 
          initialData={recipe}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default EditRecipe;