import { Database } from "bun:sqlite";

export interface Recipe {
  id?: number;
  name: string;
  description?: string;
  ingredients?: string;
  instructions?: string;
  status?: string;
  image?: string;
}

export class RecipeDatabase {
  private db: Database;

  constructor() {
    this.db = new Database("recipes.db");
    this.init()
      .then(() => console.log("Database initialized"))
      .catch((err) => console.error(err));
  }

  async getRecipes() {
    return this.db.query(`SELECT * FROM recipes`).all();
  }

  async getRecipe(id: number) {
    return this.db
      .query(
        `
        SELECT
          *
        FROM
          recipes
        WHERE
          id = ?`
      )
      .get(id);
  }

  async createRecipe(recipe: Recipe) {
    const result = await this.db
      .query(
        `
        INSERT INTO recipes (
          name,
          description,
          ingredients,
          instructions,
          image
        ) VALUES (?, ?, ?, ?, ?)
      `
      )
      .run(
        recipe.name,
        recipe.description || "",
        recipe.ingredients || "",
        recipe.instructions || "",
        recipe.image || ""
      );
  }

  async updateRecipe(recipe: Recipe) {
    if (recipe.id === undefined) {
      throw new Error("Recipe id is undefined");
    }
    return this.db
      .query(
        `
      UPDATE recipes
      SET name = ?,
        description = ?,
        ingredients = ?,
        instructions = ?,
        image = ?
      WHERE id = ?
    `
      )
      .run(
        recipe.name,
        recipe.description || "",
        recipe.ingredients || "",
        recipe.instructions || "",
        recipe.image || "",
        recipe.id
      );
  }

  async deleteRecipe(id: number) {
    return this.db.query(`DELETE FROM recipes WHERE id = ?`).run(id);
  }

  async init() {
    return this.db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        ingredients TEXT,
        instructions TEXT,
        image TEXT
      );
    `);
  }
}
