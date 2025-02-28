import React, { useState, useEffect } from 'react';
import { getRecipes, deleteRecipe } from '../services/recipeService';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../types';
import { User, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (!currentUser) return;
      
      try {
        const recipesData = await getRecipes(currentUser.uid);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching user recipes:', error);
        toast.error('Failed to load your recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipes();
  }, [currentUser]);

  const handleDeleteRecipe = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter(recipe => recipe.id !== id));
        toast.success('Recipe deleted successfully');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error('Failed to delete recipe');
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">You need to be logged in to view your profile</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center">
          <div className="bg-orange-100 p-4 rounded-full">
            <User className="h-12 w-12 text-orange-500" />
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-gray-900">{currentUser.displayName}</h1>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <ChefHat className="h-6 w-6 mr-2 text-orange-500" />
        My Recipes
      </h2>

      {recipes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">You haven't created any recipes yet</h3>
          <p className="text-gray-500 mb-4">Start creating delicious recipes to see them here!</p>
          <a 
            href="/create" 
            className="inline-block bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            Create Your First Recipe
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;