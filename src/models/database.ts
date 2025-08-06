import { Database } from 'bun:sqlite';
import {
  User,
  UserProfile,
  Cuisine,
  Recipe,
  RecipeStep,
  Ingredient,
  RecipeIngredient,
  RecipeCuisine,
  CreateRecipeRequest,
  RecipeFilterQuery,
  RecipeGroupedByCuisine,
} from '../types';

export class RecipeDatabase {
  private db: Database;
  private initialized: Promise<void>;

  constructor() {
    this.db = new Database('recipes.db');
    this.initialized = this.init();
  }

  async init() {
    try {
      // Enable WAL mode for better concurrent access
      this.db.run('PRAGMA journal_mode = WAL');
      this.db.run('PRAGMA foreign_keys = ON');

      // Create tables in proper order (dependencies first)
      await this.createUsersTable();
      await this.createCuisinesTable();
      await this.createIngredientsTable();
      await this.createRecipesTable();
      await this.createRecipeCuisinesTable();
      await this.createRecipeStepsTable();
      await this.createRecipeIngredientsTable();
      await this.createIndexes();

      console.log('Database initialized');
    } catch (err) {
      console.error('Database initialization error:', err);
      throw err;
    }
  }

  async waitForInit() {
    await this.initialized;
  }

  private async createUsersTable() {
    this.db
      .query(
        `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `
      )
      .run();
  }

  private async createCuisinesTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS cuisines (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private async createIngredientsTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      )
    `);
  }

  private async createRecipesTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        author_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL,
        updated_by TEXT NOT NULL,
        FOREIGN KEY (author_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `);
  }

  private async createRecipeCuisinesTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS recipe_cuisines (
        id TEXT PRIMARY KEY,
        recipe_id TEXT NOT NULL,
        cuisine_id TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (cuisine_id) REFERENCES cuisines(id),
        UNIQUE(recipe_id, cuisine_id)
      )
    `);
  }

  private async createRecipeStepsTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS recipe_steps (
        id TEXT PRIMARY KEY,
        recipe_id TEXT NOT NULL,
        step_number INTEGER NOT NULL,
        instruction TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        UNIQUE(recipe_id, step_number)
      )
    `);
  }

  private async createRecipeIngredientsTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id TEXT PRIMARY KEY,
        recipe_id TEXT NOT NULL,
        ingredient_id TEXT NOT NULL,
        quantity DECIMAL NOT NULL,
        unit TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        UNIQUE(recipe_id, ingredient_id)
      )
    `);
  }

  private async createIndexes() {
    // Performance indexes
    this.db.run('CREATE INDEX IF NOT EXISTS idx_recipes_author ON recipes(author_id)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at)');
    this.db.run(
      'CREATE INDEX IF NOT EXISTS idx_recipe_cuisines_recipe ON recipe_cuisines(recipe_id)'
    );
    this.db.run(
      'CREATE INDEX IF NOT EXISTS idx_recipe_cuisines_cuisine ON recipe_cuisines(cuisine_id)'
    );
    this.db.run('CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe ON recipe_steps(recipe_id)');
    this.db.run(
      'CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id)'
    );
  }

  // User methods
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = crypto.randomUUID();
    this.db
      .query(
        `
      INSERT INTO users (id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(id, user.name, user.email, user.password_hash);

    return id;
  }

  getUserByEmail(email: string): User | null {
    const result = this.db
      .query(
        `
      SELECT * FROM users WHERE email = ?
    `
      )
      .get(email) as User | null;

    return result;
  }

  getUserById(id: string): User | null {
    const result = this.db
      .query(
        `
      SELECT * FROM users WHERE id = ?
    `
      )
      .get(id) as User | null;

    return result;
  }

  getUserProfile(id: string): UserProfile | null {
    const result = this.db
      .query(
        `
      SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?
    `
      )
      .get(id) as UserProfile | null;

    return result;
  }

  updateUserLastLogin(id: string): void {
    this.db
      .query(
        `
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `
      )
      .run(id);
  }

  // Cuisine methods
  async createCuisine(cuisine: Omit<Cuisine, 'id' | 'created_at'>): Promise<string> {
    const id = crypto.randomUUID();
    this.db
      .query(
        `
      INSERT INTO cuisines (id, name, description)
      VALUES (?, ?, ?)
    `
      )
      .run(id, cuisine.name, cuisine.description || null);

    return id;
  }

  getCuisineByName(name: string): Cuisine | null {
    const result = this.db
      .query(
        `
      SELECT * FROM cuisines WHERE name = ?
    `
      )
      .get(name) as Cuisine | null;

    return result;
  }

  // Ingredient methods
  createIngredient(ingredient: { name: string }): string {
    const id = crypto.randomUUID();
    this.db
      .query(
        `
      INSERT INTO ingredients (id, name)
      VALUES (?, ?)
    `
      )
      .run(id, ingredient.name);

    return id;
  }

  getIngredientByName(name: string): { id: string; name: string } | null {
    const result = this.db
      .query(
        `
      SELECT * FROM ingredients WHERE name = ?
    `
      )
      .get(name) as { id: string; name: string } | null;

    return result;
  }

  async getCuisines(): Promise<Cuisine[]> {
    return this.db.query('SELECT * FROM cuisines ORDER BY name').all() as Cuisine[];
  }

  async getCuisineById(id: string): Promise<Cuisine | null> {
    return this.db.query('SELECT * FROM cuisines WHERE id = ?').get(id) as Cuisine | null;
  }

  async updateCuisine(
    id: string,
    cuisine: Partial<Omit<Cuisine, 'id' | 'created_at'>>
  ): Promise<void> {
    this.db
      .query(
        `
      UPDATE cuisines
      SET name = COALESCE(?, name), description = COALESCE(?, description)
      WHERE id = ?
    `
      )
      .run(cuisine.name || null, cuisine.description || null, id);
  }

  async deleteCuisine(id: string): Promise<void> {
    this.db.query('DELETE FROM cuisines WHERE id = ?').run(id);
  }

  // Ingredient methods
  async getOrCreateIngredient(name: string): Promise<string> {
    const ingredient = this.db
      .query('SELECT * FROM ingredients WHERE name = ?')
      .get(name) as Ingredient | null;

    if (!ingredient) {
      const id = crypto.randomUUID();
      this.db.query('INSERT INTO ingredients (id, name) VALUES (?, ?)').run(id, name);
      return id;
    }

    return ingredient.id;
  }

  // Recipe methods
  async createRecipe(recipe: {
    name: string;
    description: string;
    author_id?: string;
    created_by?: string;
    updated_by?: string;
    cuisines?: string[];
    ingredients?: Array<{
      name: string;
      quantity?: number;
      unit?: string;
      notes?: string;
    }>;
    steps?: Array<{ step_number: number; instruction: string }>;
  }): Promise<string> {
    const id = crypto.randomUUID();

    // Use a default user ID if not provided (for seeding)
    const authorId = recipe.author_id || crypto.randomUUID();
    const createdBy = recipe.created_by || authorId;
    const updatedBy = recipe.updated_by || authorId;

    const tx = this.db.transaction(() => {
      // Insert the main recipe
      this.db
        .query(
          `
        INSERT INTO recipes (id, name, description, author_id, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `
        )
        .run(id, recipe.name, recipe.description, authorId, createdBy, updatedBy);

      // Insert cuisine associations
      if (recipe.cuisines && recipe.cuisines.length > 0) {
        for (const cuisineId of recipe.cuisines) {
          this.db
            .query(
              `
            INSERT INTO recipe_cuisines (id, recipe_id, cuisine_id)
            VALUES (?, ?, ?)
          `
            )
            .run(crypto.randomUUID(), id, cuisineId);
        }
      }

      // Insert ingredients
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        for (const ingredient of recipe.ingredients) {
          // First, create or find the ingredient
          let ingredientId: string;
          try {
            ingredientId = this.createIngredient({ name: ingredient.name });
          } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
              // Ingredient already exists, find it
              const existing = this.getIngredientByName(ingredient.name);
              if (existing) {
                ingredientId = existing.id;
              } else {
                throw error;
              }
            } else {
              throw error;
            }
          }

          // Then create the recipe-ingredient relationship
          this.db
            .query(
              `
            INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit)
            VALUES (?, ?, ?, ?, ?)
          `
            )
            .run(
              crypto.randomUUID(),
              id,
              ingredientId,
              ingredient.quantity || 0,
              ingredient.unit || ''
            );
        }
      }

      // Insert steps
      if (recipe.steps && recipe.steps.length > 0) {
        for (const step of recipe.steps) {
          this.db
            .query(
              `
            INSERT INTO recipe_steps (id, recipe_id, step_number, instruction)
            VALUES (?, ?, ?, ?)
          `
            )
            .run(crypto.randomUUID(), id, step.step_number, step.instruction);
        }
      }
    });

    tx();
    return id;
  }

  getRecipeByName(name: string): Recipe | null {
    const result = this.db
      .query(
        `
      SELECT * FROM recipes WHERE name = ?
    `
      )
      .get(name) as Recipe | null;

    return result;
  }

  private getOrCreateIngredientSync(name: string): string {
    const ingredient = this.db
      .query('SELECT * FROM ingredients WHERE name = ?')
      .get(name) as Ingredient | null;

    if (!ingredient) {
      const id = crypto.randomUUID();
      this.db.query('INSERT INTO ingredients (id, name) VALUES (?, ?)').run(id, name);
      return id;
    }

    return ingredient.id;
  }

  async getRecipes(filter: RecipeFilterQuery = {}): Promise<{ recipes: Recipe[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      cuisines = [],
      author_id,
      search,
    } = filter;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    // Build WHERE clause
    if (author_id) {
      whereClause += ' AND r.author_id = ?';
      params.push(author_id);
    }

    if (cuisines.length > 0) {
      const placeholders = cuisines.map(() => '?').join(',');
      whereClause += ` AND r.id IN (
        SELECT rc.recipe_id FROM recipe_cuisines rc
        WHERE rc.cuisine_id IN (${placeholders})
      )`;
      params.push(...cuisines);
    }

    if (search) {
      whereClause += ` AND (
        r.name LIKE ? OR
        r.description LIKE ? OR
        r.id IN (
          SELECT ri.recipe_id FROM recipe_ingredients ri
          JOIN ingredients i ON ri.ingredient_id = i.id
          WHERE i.name LIKE ?
        )
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT r.id) as total
      FROM recipes r
      ${whereClause}
    `;
    const { total } = this.db.query(countQuery).get(...params) as {
      total: number;
    };

    // Get recipes with pagination
    const offset = (page - 1) * limit;
    const recipesQuery = `
      SELECT DISTINCT r.*,
        u.name as author_name,
        GROUP_CONCAT(c.name) as cuisine_names
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      LEFT JOIN recipe_cuisines rc ON r.id = rc.recipe_id
      LEFT JOIN cuisines c ON rc.cuisine_id = c.id
      ${whereClause}
      GROUP BY r.id
      ORDER BY r.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const recipes = this.db.query(recipesQuery).all(...params, limit, offset) as Recipe[];

    return { recipes, total };
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    const recipe = this.db
      .query(
        `
      SELECT r.*, u.name as author_name
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE r.id = ?
    `
      )
      .get(id) as Recipe | null;

    if (!recipe) return null;

    // Get cuisines
    const cuisines = this.db
      .query(
        `
      SELECT c.*
      FROM cuisines c
      JOIN recipe_cuisines rc ON c.id = rc.cuisine_id
      WHERE rc.recipe_id = ?
    `
      )
      .all(id) as Cuisine[];

    // Get steps
    const steps = this.db
      .query(
        `
      SELECT * FROM recipe_steps
      WHERE recipe_id = ?
      ORDER BY step_number
    `
      )
      .all(id) as RecipeStep[];

    // Get ingredients
    const ingredients = this.db
      .query(
        `
      SELECT ri.*, i.name as ingredient_name
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ?
    `
      )
      .all(id) as any[];

    recipe.cuisines = cuisines;
    recipe.steps = steps;
    recipe.ingredients = ingredients;

    return recipe;
  }

  async updateRecipe(
    id: string,
    recipeData: Partial<CreateRecipeRequest>,
    userId: string
  ): Promise<void> {
    const transaction = this.db.transaction(() => {
      // Update basic recipe info
      if (recipeData.name || recipeData.description) {
        this.db
          .query(
            `
          UPDATE recipes
          SET name = COALESCE(?, name),
              description = COALESCE(?, description),
              updated_by = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
          )
          .run(recipeData.name || null, recipeData.description || null, userId, id);
      }

      // Update cuisines if provided
      if (recipeData.cuisines) {
        // Delete existing associations
        this.db.query('DELETE FROM recipe_cuisines WHERE recipe_id = ?').run(id);

        // Insert new associations
        recipeData.cuisines.forEach(cuisineId => {
          const associationId = crypto.randomUUID();
          this.db
            .query(
              `
            INSERT INTO recipe_cuisines (id, recipe_id, cuisine_id)
            VALUES (?, ?, ?)
          `
            )
            .run(associationId, id, cuisineId);
        });
      }

      // Update steps if provided
      if (recipeData.steps) {
        this.db.query('DELETE FROM recipe_steps WHERE recipe_id = ?').run(id);

        recipeData.steps.forEach(step => {
          const stepId = crypto.randomUUID();
          this.db
            .query(
              `
            INSERT INTO recipe_steps (id, recipe_id, step_number, instruction)
            VALUES (?, ?, ?, ?)
          `
            )
            .run(stepId, id, step.step_number, step.instruction);
        });
      }

      // Update ingredients if provided
      if (recipeData.ingredients) {
        this.db.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(id);

        recipeData.ingredients.forEach(ingredient => {
          const ingredientId = this.getOrCreateIngredientSync(ingredient.name);
          const associationId = crypto.randomUUID();
          this.db
            .query(
              `
            INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit)
            VALUES (?, ?, ?, ?, ?)
          `
            )
            .run(associationId, id, ingredientId, ingredient.quantity, ingredient.unit);
        });
      }
    });

    transaction();
  }

  async archiveRecipe(id: string): Promise<void> {
    // For now, we'll implement soft delete by adding a status field
    // You might want to add an 'archived' or 'status' column to the recipes table
    this.db.query('DELETE FROM recipes WHERE id = ?').run(id);
  }

  async getRecipesByCuisine(cuisineId: string, filter: RecipeFilterQuery = {}): Promise<Recipe[]> {
    const newFilter = { ...filter, cuisines: [cuisineId] };
    const { recipes } = await this.getRecipes(newFilter);
    return recipes;
  }

  async getRecipesGroupedByCuisine(): Promise<RecipeGroupedByCuisine[]> {
    const results = this.db
      .query(
        `
      SELECT
        c.id as cuisine_id,
        c.name as cuisine_name,
        COUNT(r.id) as recipe_count,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', r.id,
            'name', r.name,
            'description', r.description
          )
        ) as recipes_json
      FROM cuisines c
      LEFT JOIN recipe_cuisines rc ON c.id = rc.cuisine_id
      LEFT JOIN recipes r ON rc.recipe_id = r.id
      WHERE r.id IS NOT NULL
      GROUP BY c.id, c.name
      ORDER BY c.name ASC
    `
      )
      .all() as any[];

    return results.map(result => ({
      cuisine_id: result.cuisine_id,
      cuisine_name: result.cuisine_name,
      recipe_count: result.recipe_count,
      recipes: result.recipes_json ? JSON.parse(`[${result.recipes_json}]`) : [],
    }));
  }

  // Update user profile
  updateUser(userId: string, updates: { name?: string; email?: string }): void {
    const updateFields: string[] = [];
    const values: (string | number)[] = [];

    if (updates.name) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.email) {
      updateFields.push('email = ?');
      values.push(updates.email);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      this.db
        .query(
          `
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `
        )
        .run(...values);
    }
  }

  // Update user password
  updateUserPassword(userId: string, passwordHash: string): void {
    this.db
      .query(
        `
      UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `
      )
      .run(passwordHash, userId);
  }
}
