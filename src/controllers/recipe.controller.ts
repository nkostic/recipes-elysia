import { Context } from 'elysia';
import { RecipeDatabase } from '../models/database';
import {
  CreateRecipeRequest,
  UpdateRecipeRequest,
  RecipeFilterQuery,
  ApiResponse,
  Recipe,
  ApiError,
} from '../types';

export class RecipeController {
  constructor(private db: RecipeDatabase) {}

  async getRecipes(context: Context): Promise<ApiResponse<Recipe[]>> {
    try {
      const query = context.query as RecipeFilterQuery;
      const { recipes, total } = await this.db.getRecipes(query);

      const page = query.page || 1;
      const limit = query.limit || 20;

      return {
        success: true,
        data: recipes,
        pagination: {
          page,
          limit,
          total,
        },
      };
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw new ApiError(500, 'Failed to fetch recipes');
    }
  }

  async getRecipeById(context: Context): Promise<ApiResponse<Recipe>> {
    try {
      const { id } = context.params as { id: string };
      const recipe = await this.db.getRecipeById(id);

      if (!recipe) {
        throw new ApiError(404, 'Recipe not found');
      }

      return {
        success: true,
        data: recipe,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error fetching recipe:', error);
      throw new ApiError(500, 'Failed to fetch recipe');
    }
  }

  async createRecipe(context: Context): Promise<ApiResponse<{ id: string }>> {
    try {
      const body = context.body as CreateRecipeRequest;
      // TODO: Get user ID from authentication middleware
      const userId = 'temp-user-id'; // This should come from auth

      const recipeId = await this.db.createRecipe(body, userId);

      context.set.status = 201;
      return {
        success: true,
        data: { id: recipeId },
      };
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw new ApiError(400, 'Failed to create recipe');
    }
  }

  async updateRecipe(context: Context): Promise<ApiResponse<{ message: string }>> {
    try {
      const { id } = context.params as { id: string };
      const body = context.body as UpdateRecipeRequest;
      // TODO: Get user ID from authentication middleware
      const userId = 'temp-user-id'; // This should come from auth

      // Check if recipe exists
      const existingRecipe = await this.db.getRecipeById(id);
      if (!existingRecipe) {
        throw new ApiError(404, 'Recipe not found');
      }

      await this.db.updateRecipe(id, body, userId);

      return {
        success: true,
        data: { message: 'Recipe updated successfully' },
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error updating recipe:', error);
      throw new ApiError(500, 'Failed to update recipe');
    }
  }

  async archiveRecipe(context: Context): Promise<ApiResponse<{ message: string }>> {
    try {
      const { id } = context.params as { id: string };

      // Check if recipe exists
      const existingRecipe = await this.db.getRecipeById(id);
      if (!existingRecipe) {
        throw new ApiError(404, 'Recipe not found');
      }

      await this.db.archiveRecipe(id);

      return {
        success: true,
        data: { message: 'Recipe archived successfully' },
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error archiving recipe:', error);
      throw new ApiError(500, 'Failed to archive recipe');
    }
  }

  async getRecipesByCuisine(context: Context): Promise<ApiResponse<Recipe[]>> {
    try {
      const { cuisineId } = context.params as { cuisineId: string };
      const query = context.query as RecipeFilterQuery;

      const recipes = await this.db.getRecipesByCuisine(cuisineId, query);

      return {
        success: true,
        data: recipes,
      };
    } catch (error) {
      console.error('Error fetching recipes by cuisine:', error);
      throw new ApiError(500, 'Failed to fetch recipes by cuisine');
    }
  }

  async getRecipesGroupedByCuisine(context: Context): Promise<ApiResponse<any[]>> {
    try {
      const groupedRecipes = await this.db.getRecipesGroupedByCuisine();

      return {
        success: true,
        data: groupedRecipes,
      };
    } catch (error) {
      console.error('Error fetching grouped recipes:', error);
      throw new ApiError(500, 'Failed to fetch grouped recipes');
    }
  }
}
