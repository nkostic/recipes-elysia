// Core entity types based on database schema
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Cuisine {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  // Related data (populated via joins)
  author?: User;
  cuisines?: Cuisine[];
  steps?: RecipeStep[];
  ingredients?: RecipeIngredientWithDetails[];
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
}

export interface Ingredient {
  id: string;
  name: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
}

export interface RecipeIngredientWithDetails extends RecipeIngredient {
  ingredient?: Ingredient;
}

export interface RecipeCuisine {
  id: string;
  recipe_id: string;
  cuisine_id: string;
}

// Request/Response types
export interface CreateRecipeRequest {
  name: string;
  description: string;
  cuisines: string[]; // Array of cuisine IDs
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: {
    step_number: number;
    instruction: string;
  }[];
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  id: string;
}

export interface CreateCuisineRequest {
  name: string;
  description?: string;
}

export interface RecipeFilterQuery {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'author';
  sortOrder?: 'asc' | 'desc';
  cuisines?: string[];
  author_id?: string;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface RecipeGroupedByCuisine {
  cuisine_id: string;
  cuisine_name: string;
  recipe_count: number;
  recipes: Recipe[];
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

// File upload types
export interface FileUploadInfo {
  recipe_id: string;
  type: 'hero' | 'step';
  step_number?: number;
  filename: string;
  path: string;
}
