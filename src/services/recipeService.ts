import { db } from '../firebase/config';
import { collection, addDoc, getDocs, getDoc, doc, query, where, deleteDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Recipe } from '../types';

const recipesCollection = collection(db, 'recipes');

export const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(recipesCollection, {
      ...recipe,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

export const getRecipes = async (userId?: string) => {
  try {
    let q = query(recipesCollection, orderBy('createdAt', 'desc'));
    
    if (userId) {
      q = query(recipesCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Recipe[];
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw error;
  }
};

export const getRecipe = async (id: string) => {
  try {
    const docRef = doc(db, 'recipes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Recipe;
    } else {
      throw new Error('Recipe not found');
    }
  } catch (error) {
    console.error('Error getting recipe:', error);
    throw error;
  }
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
  try {
    const docRef = doc(db, 'recipes', id);
    await updateDoc(docRef, recipe);
    return id;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (id: string) => {
  try {
    const docRef = doc(db, 'recipes', id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};