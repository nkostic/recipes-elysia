import { Elysia } from 'elysia';
import { RecipeController } from '../controllers/recipe.controller';
import { CuisineController } from '../controllers/cuisine.controller';
import { FileController } from '../controllers/file.controller';
import { RecipeDatabase } from '../models/database';
import {
  createRecipeSchema,
  updateRecipeSchema,
  createCuisineSchema,
  updateCuisineSchema,
  recipeFilterSchema,
  idParamSchema,
  cuisineIdParamSchema,
  stepPhotoParamSchema,
  fileServeParamSchema,
} from '../validators/schemas';

export const createRoutes = (db: RecipeDatabase) => {
  const recipeController = new RecipeController(db);
  const cuisineController = new CuisineController(db);
  const fileController = new FileController();

  return (
    new Elysia({ prefix: '/api/v1' })
      // Recipe routes
      .group('/recipes', app =>
        app
          .get('/', recipeController.getRecipes.bind(recipeController), {
            query: recipeFilterSchema,
            detail: {
              tags: ['Recipes'],
              summary: 'List recipes with filtering and sorting',
            },
          })
          .get(
            '/grouped-by-cuisine',
            recipeController.getRecipesGroupedByCuisine.bind(recipeController),
            {
              detail: {
                tags: ['Recipes'],
                summary: 'Get recipes grouped by cuisine for homepage',
              },
            }
          )
          .get(
            '/by-cuisine/:cuisineId',
            recipeController.getRecipesByCuisine.bind(recipeController),
            {
              params: cuisineIdParamSchema,
              query: recipeFilterSchema,
              detail: {
                tags: ['Recipes'],
                summary: 'Get recipes by specific cuisine',
              },
            }
          )
          .get('/:id', recipeController.getRecipeById.bind(recipeController), {
            params: idParamSchema,
            detail: {
              tags: ['Recipes'],
              summary: 'Get single recipe with full details',
            },
          })
          .post('/', recipeController.createRecipe.bind(recipeController), {
            body: createRecipeSchema,
            detail: {
              tags: ['Recipes'],
              summary: 'Create new recipe',
            },
          })
          .put('/:id', recipeController.updateRecipe.bind(recipeController), {
            params: idParamSchema,
            body: updateRecipeSchema,
            detail: {
              tags: ['Recipes'],
              summary: 'Update existing recipe',
            },
          })
          .delete('/:id', recipeController.archiveRecipe.bind(recipeController), {
            params: idParamSchema,
            detail: {
              tags: ['Recipes'],
              summary: 'Archive recipe',
            },
          })
          // File upload routes for recipes
          .post('/:id/photos/hero', fileController.uploadHeroPhoto.bind(fileController), {
            params: idParamSchema,
            detail: {
              tags: ['Files'],
              summary: 'Upload hero photo for recipe',
            },
          })
          .post(
            '/:id/photos/steps/:stepNumber',
            fileController.uploadStepPhoto.bind(fileController),
            {
              params: stepPhotoParamSchema,
              detail: {
                tags: ['Files'],
                summary: 'Upload step photo for recipe',
              },
            }
          )
      )

      // Cuisine routes
      .group('/cuisines', app =>
        app
          .get('/', cuisineController.getCuisines.bind(cuisineController), {
            detail: {
              tags: ['Cuisines'],
              summary: 'List all available cuisines',
            },
          })
          .get('/:id', cuisineController.getCuisineById.bind(cuisineController), {
            params: idParamSchema,
            detail: {
              tags: ['Cuisines'],
              summary: 'Get single cuisine with details',
            },
          })
          .post('/', cuisineController.createCuisine.bind(cuisineController), {
            body: createCuisineSchema,
            detail: {
              tags: ['Cuisines'],
              summary: 'Create new cuisine',
            },
          })
          .put('/:id', cuisineController.updateCuisine.bind(cuisineController), {
            params: idParamSchema,
            body: updateCuisineSchema,
            detail: {
              tags: ['Cuisines'],
              summary: 'Update existing cuisine',
            },
          })
          .delete('/:id', cuisineController.deleteCuisine.bind(cuisineController), {
            params: idParamSchema,
            detail: {
              tags: ['Cuisines'],
              summary: 'Delete cuisine',
            },
          })
      )

      // File serving route
      .get('/files/:recipeId/:filename', fileController.serveFile.bind(fileController), {
        params: fileServeParamSchema,
        detail: {
          tags: ['Files'],
          summary: 'Serve uploaded photos',
        },
      })
  );
};
