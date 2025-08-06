import { t } from 'elysia';

// Recipe validation schemas
export const createRecipeSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  description: t.String({ maxLength: 1000 }),
  cuisines: t.Array(t.String()), // Array of cuisine IDs
  ingredients: t.Array(
    t.Object({
      name: t.String({ minLength: 1 }),
      quantity: t.Number({ minimum: 0 }),
      unit: t.String({ minLength: 1 }),
    })
  ),
  steps: t.Array(
    t.Object({
      step_number: t.Number({ minimum: 1 }),
      instruction: t.String({ minLength: 1 }),
    })
  ),
});

export const updateRecipeSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  description: t.Optional(t.String({ maxLength: 1000 })),
  cuisines: t.Optional(t.Array(t.String())),
  ingredients: t.Optional(
    t.Array(
      t.Object({
        name: t.String({ minLength: 1 }),
        quantity: t.Number({ minimum: 0 }),
        unit: t.String({ minLength: 1 }),
      })
    )
  ),
  steps: t.Optional(
    t.Array(
      t.Object({
        step_number: t.Number({ minimum: 1 }),
        instruction: t.String({ minLength: 1 }),
      })
    )
  ),
});

// Cuisine validation schemas
export const createCuisineSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 50 }),
  description: t.Optional(t.String({ maxLength: 500 })),
});

export const updateCuisineSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
  description: t.Optional(t.String({ maxLength: 500 })),
});

// Query parameter schemas
export const recipeFilterSchema = t.Object({
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  sortBy: t.Optional(
    t.Union([
      t.Literal('name'),
      t.Literal('created_at'),
      t.Literal('updated_at'),
      t.Literal('author'),
    ])
  ),
  sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  cuisines: t.Optional(t.Array(t.String())), // Filter by cuisine IDs
  author_id: t.Optional(t.String()),
  search: t.Optional(t.String()),
});

// Parameter schemas
export const idParamSchema = t.Object({
  id: t.String(),
});

export const cuisineIdParamSchema = t.Object({
  cuisineId: t.String(),
});

// File upload schemas
export const fileUploadParamSchema = t.Object({
  id: t.String(),
  stepNumber: t.Optional(t.String()),
});

export const stepPhotoParamSchema = t.Object({
  id: t.String(),
  stepNumber: t.String(),
});

export const fileServeParamSchema = t.Object({
  recipeId: t.String(),
  filename: t.String(),
});

// User validation schemas
export const createUserSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  email: t.String({ format: 'email' }),
});

// Authentication validation schemas
export const registerSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8, maxLength: 128 }),
});

export const loginSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 1 }),
});

export const refreshTokenSchema = t.Object({
  refreshToken: t.String(),
});

export const changePasswordSchema = t.Object({
  currentPassword: t.String({ minLength: 1 }),
  newPassword: t.String({ minLength: 8, maxLength: 128 }),
});

export const updateProfileSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  email: t.Optional(t.String({ format: 'email' })),
});
