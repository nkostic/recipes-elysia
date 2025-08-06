import { RecipeDatabase } from './models/database';

async function seedDatabase() {
  const db = new RecipeDatabase();

  console.log('🌱 Seeding database...');

  try {
    // Wait for database initialization to complete
    await db.waitForInit();

    // Create a test user (check if exists first)
    let userId: string;
    try {
      userId = await db.createUser({
        name: 'Chef Demo',
        email: 'chef@demo.com',
      });
      console.log('✅ Created test user:', userId);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        // User already exists, find them
        const existingUser = db.getUserByEmail('chef@demo.com');
        if (existingUser) {
          userId = existingUser.id;
          console.log('✅ Using existing user:', userId);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    // Create some cuisines (check if they exist first)
    let italianId: string;
    let mexicanId: string;

    // Italian cuisine
    try {
      italianId = await db.createCuisine({
        name: 'Italian',
        description:
          'Traditional Italian cuisine featuring pasta, pizza, and Mediterranean flavors',
      });
      console.log('✅ Created Italian cuisine:', italianId);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const existing = db.getCuisineByName('Italian');
        if (existing) {
          italianId = existing.id;
          console.log('✅ Using existing Italian cuisine:', italianId);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    // Mexican cuisine
    try {
      mexicanId = await db.createCuisine({
        name: 'Mexican',
        description: 'Vibrant Mexican cuisine with spices, peppers, and authentic flavors',
      });
      console.log('✅ Created Mexican cuisine:', mexicanId);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const existing = db.getCuisineByName('Mexican');
        if (existing) {
          mexicanId = existing.id;
          console.log('✅ Using existing Mexican cuisine:', mexicanId);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    // Asian cuisine
    let asianId: string;
    try {
      asianId = await db.createCuisine({
        name: 'Asian',
        description: 'Diverse Asian flavors from various countries and cooking traditions',
      });
      console.log('✅ Created Asian cuisine:', asianId);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const existing = db.getCuisineByName('Asian');
        if (existing) {
          asianId = existing.id;
          console.log('✅ Using existing Asian cuisine:', asianId);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    console.log('✅ All cuisines ready');

    // Create some sample recipes (check if they exist first)
    let pastaRecipe: string;
    try {
      pastaRecipe = await db.createRecipe({
        name: 'Classic Spaghetti Carbonara',
        description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta',
        author_id: userId,
        created_by: userId,
        updated_by: userId,
        cuisines: [italianId],
        ingredients: [
          { name: 'Spaghetti', quantity: 400, unit: 'grams' },
          { name: 'Pancetta', quantity: 200, unit: 'grams' },
          { name: 'Eggs', quantity: 4, unit: 'whole' },
          { name: 'Parmesan cheese', quantity: 100, unit: 'grams' },
          { name: 'Black pepper', quantity: 1, unit: 'teaspoon' },
        ],
        steps: [
          {
            step_number: 1,
            instruction:
              'Bring a large pot of salted water to boil and cook spaghetti according to package directions',
          },
          {
            step_number: 2,
            instruction: 'Cut pancetta into small cubes and cook in a large pan until crispy',
          },
          {
            step_number: 3,
            instruction: 'In a bowl, whisk together eggs, grated parmesan, and black pepper',
          },
          {
            step_number: 4,
            instruction: 'Drain pasta and immediately toss with pancetta and egg mixture',
          },
          {
            step_number: 5,
            instruction: 'Serve immediately with extra parmesan and black pepper',
          },
        ],
      });
      console.log('✅ Created pasta recipe:', pastaRecipe);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const existing = db.getRecipeByName('Classic Spaghetti Carbonara');
        if (existing) {
          pastaRecipe = existing.id;
          console.log('✅ Using existing pasta recipe:', pastaRecipe);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    let tacosRecipe: string;
    try {
      tacosRecipe = await db.createRecipe({
        name: 'Beef Tacos',
        description: 'Delicious Mexican-style beef tacos with fresh toppings',
        author_id: userId,
        created_by: userId,
        updated_by: userId,
        cuisines: [mexicanId],
        ingredients: [
          { name: 'Ground beef', quantity: 500, unit: 'grams' },
          { name: 'Taco shells', quantity: 8, unit: 'pieces' },
          { name: 'Onion', quantity: 1, unit: 'medium' },
          { name: 'Tomatoes', quantity: 2, unit: 'medium' },
          { name: 'Lettuce', quantity: 200, unit: 'grams' },
          { name: 'Cheddar cheese', quantity: 100, unit: 'grams' },
        ],
        steps: [
          {
            step_number: 1,
            instruction: 'Brown the ground beef in a large skillet over medium heat',
          },
          {
            step_number: 2,
            instruction: 'Add diced onions and cook until translucent',
          },
          {
            step_number: 3,
            instruction: 'Season with taco seasoning and cook for 2 more minutes',
          },
          {
            step_number: 4,
            instruction: 'Warm taco shells according to package directions',
          },
          {
            step_number: 5,
            instruction: 'Fill shells with meat mixture and top with lettuce, tomatoes, and cheese',
          },
        ],
      });
      console.log('✅ Created tacos recipe:', tacosRecipe);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const existing = db.getRecipeByName('Beef Tacos');
        if (existing) {
          tacosRecipe = existing.id;
          console.log('✅ Using existing tacos recipe:', tacosRecipe);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    let stirFryRecipe: string;
    try {
      stirFryRecipe = await db.createRecipe({
        name: 'Vegetable Stir Fry',
        description: 'Quick and healthy Asian-style vegetable stir fry',
        author_id: userId,
        created_by: userId,
        updated_by: userId,
        cuisines: [asianId],
        ingredients: [
          { name: 'Mixed vegetables', quantity: 500, unit: 'grams' },
          { name: 'Soy sauce', quantity: 3, unit: 'tablespoons' },
          { name: 'Garlic', quantity: 3, unit: 'cloves' },
          { name: 'Ginger', quantity: 1, unit: 'tablespoon' },
          { name: 'Vegetable oil', quantity: 2, unit: 'tablespoons' },
          { name: 'Rice', quantity: 200, unit: 'grams' },
        ],
        steps: [
          {
            step_number: 1,
            instruction: 'Cook rice according to package directions',
          },
          {
            step_number: 2,
            instruction: 'Heat oil in a large wok or skillet over high heat',
          },
          {
            step_number: 3,
            instruction: 'Add minced garlic and ginger, stir for 30 seconds',
          },
          {
            step_number: 4,
            instruction: 'Add vegetables and stir-fry for 3-4 minutes until crisp-tender',
          },
          {
            step_number: 5,
            instruction: 'Add soy sauce and toss to combine, serve over rice',
          },
        ],
      });
      console.log('✅ Created stir fry recipe:', stirFryRecipe);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const existing = db.getRecipeByName('Vegetable Stir Fry');
        if (existing) {
          stirFryRecipe = existing.id;
          console.log('✅ Using existing stir fry recipe:', stirFryRecipe);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    console.log('✅ Created sample recipes');
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run if called directly
if (import.meta.main) {
  seedDatabase();
}

export { seedDatabase };
