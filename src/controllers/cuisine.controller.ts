import { Context } from 'elysia';
import { RecipeDatabase } from '../models/database';
import { CreateCuisineRequest, ApiResponse, Cuisine, ApiError } from '../types';

export class CuisineController {
  constructor(private db: RecipeDatabase) {}

  async getCuisines(context: Context): Promise<ApiResponse<Cuisine[]>> {
    try {
      const cuisines = await this.db.getCuisines();

      return {
        success: true,
        data: cuisines,
      };
    } catch (error) {
      console.error('Error fetching cuisines:', error);
      throw new ApiError(500, 'Failed to fetch cuisines');
    }
  }

  async getCuisineById(context: Context): Promise<ApiResponse<Cuisine>> {
    try {
      const { id } = context.params as { id: string };
      const cuisine = await this.db.getCuisineById(id);

      if (!cuisine) {
        throw new ApiError(404, 'Cuisine not found');
      }

      return {
        success: true,
        data: cuisine,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error fetching cuisine:', error);
      throw new ApiError(500, 'Failed to fetch cuisine');
    }
  }

  async createCuisine(context: Context): Promise<ApiResponse<{ id: string }>> {
    try {
      const body = context.body as CreateCuisineRequest;

      const cuisineId = await this.db.createCuisine(body);

      context.set.status = 201;
      return {
        success: true,
        data: { id: cuisineId },
      };
    } catch (error) {
      console.error('Error creating cuisine:', error);
      throw new ApiError(400, 'Failed to create cuisine');
    }
  }

  async updateCuisine(context: Context): Promise<ApiResponse<{ message: string }>> {
    try {
      const { id } = context.params as { id: string };
      const body = context.body as Partial<CreateCuisineRequest>;

      // Check if cuisine exists
      const existingCuisine = await this.db.getCuisineById(id);
      if (!existingCuisine) {
        throw new ApiError(404, 'Cuisine not found');
      }

      await this.db.updateCuisine(id, body);

      return {
        success: true,
        data: { message: 'Cuisine updated successfully' },
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error updating cuisine:', error);
      throw new ApiError(500, 'Failed to update cuisine');
    }
  }

  async deleteCuisine(context: Context): Promise<ApiResponse<{ message: string }>> {
    try {
      const { id } = context.params as { id: string };

      // Check if cuisine exists
      const existingCuisine = await this.db.getCuisineById(id);
      if (!existingCuisine) {
        throw new ApiError(404, 'Cuisine not found');
      }

      await this.db.deleteCuisine(id);

      return {
        success: true,
        data: { message: 'Cuisine deleted successfully' },
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error deleting cuisine:', error);
      throw new ApiError(500, 'Failed to delete cuisine');
    }
  }
}
