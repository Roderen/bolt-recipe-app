import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../services/recipeService';
import { Recipe } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, Trash2, Edit, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      
      try {
        const recipeData = await getRecipe(id);
        setRecipe(recipeData);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast.error('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (!recipe || !id) return;
    
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        toast.success('Recipe deleted successfully');
        navigate('/');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error('Failed to delete recipe');
      }
    }
  };

  if (loading) {
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
        <Link to="/" className="text-orange-500 hover:text-orange-600">
          Return to home
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.uid === recipe.userId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-6">
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to recipes
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img 
          src={recipe.imageUrl || defaultImage} 
          alt={recipe.title} 
          className="w-full h-64 object-cover"
        />
        
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            
            {isOwner && (
              <div className="flex space-x-2">
                <Link 
                  to={`/edit/${recipe.id}`}
                  className="inline-flex items-center text-blue-500 hover:text-blue-600"
                >
                  <Edit className="h-5 w-5 mr-1" />
                  Edit
                </Link>
                <button 
                  onClick={handleDelete}
                  className="inline-flex items-center text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5 mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-gray-500 mb-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-1" />
              <span>{recipe.cookingTime} mins</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-1" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-8">{recipe.description}</p>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700">{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;