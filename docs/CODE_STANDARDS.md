# Backend Code Standards & Best Practices

## Technology Stack

### Runtime & Framework

- **Bun**: Modern JavaScript runtime for high performance
- **Elysia**: TypeScript-first web framework with excellent performance
- **TypeScript**: Strict TypeScript configuration for type safety
- **SQLite**: Lightweight, serverless database for local development and production

### Development Tools

- **Bun Package Manager**: Fast package installation and management
- **ESLint**: TypeScript and Node.js specific linting rules
- **Prettier**: Consistent code formatting

## Project Structure

### Directory Organization

```
src/
├── controllers/         # Route handlers and business logic
├── models/             # Database models and schemas
├── middleware/         # Custom middleware functions
├── routes/             # Route definitions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── validators/         # Input validation schemas
└── db/                 # Database connection and migrations
files/                  # Uploaded files storage
├── {recipe-id}/        # Photos organized by recipe ID
│   ├── hero.jpg        # Hero photo
│   └── step-{n}.jpg    # Step photos
tests/                  # Test files
├── unit/               # Unit tests
├── integration/        # Integration tests
└── fixtures/           # Test data
```

## Elysia Best Practices

### Application Structure

```typescript
import { Elysia } from 'elysia';

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .group('/api/v1', app =>
    app
      .use(authMiddleware)
      // Recipe routes
      .get('/recipes', getRecipes)
      .get('/recipes/grouped-by-cuisine', getRecipesGroupedByCuisine)
      .get('/recipes/by-cuisine/:cuisineId', getRecipesByCuisine)
      .get('/recipes/:id', getRecipe)
      .post('/recipes', createRecipe)
      .put('/recipes/:id', updateRecipe)
      .delete('/recipes/:id', archiveRecipe)
      // Cuisine routes
      .get('/cuisines', getCuisines)
      .get('/cuisines/:id', getCuisine)
      .post('/cuisines', createCuisine)
      .put('/cuisines/:id', updateCuisine)
      .delete('/cuisines/:id', deleteCuisine)
  )
  .listen(3000);
```

### Route Handlers

```typescript
// Use proper typing for handlers
interface CreateRecipeBody {
  name: string;
  description: string;
  cuisines: string[]; // Array of cuisine IDs
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

interface RecipeFilterQuery {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'author';
  sortOrder?: 'asc' | 'desc';
  cuisines?: string[]; // Filter by cuisine IDs
  author_id?: string;
  search?: string;
}

export const createRecipe = async ({ body, set }: Context<CreateRecipeBody>) => {
  try {
    // Validation logic
    const recipe = await recipeService.create(body);
    set.status = 201;
    return { success: true, data: recipe };
  } catch (error) {
    set.status = 400;
    return { success: false, error: error.message };
  }
};

export const getRecipesGroupedByCuisine = async ({ query, set }: Context) => {
  try {
    const groupedRecipes = await recipeService.getGroupedByCuisine();
    return { success: true, data: groupedRecipes };
  } catch (error) {
    set.status = 500;
    return { success: false, error: error.message };
  }
};

export const getRecipesByCuisine = async ({ params, query, set }: Context) => {
  try {
    const { cuisineId } = params;
    const recipes = await recipeService.getByCuisine(cuisineId, query);
    return { success: true, data: recipes };
  } catch (error) {
    set.status = 500;
    return { success: false, error: error.message };
  }
};
```

### Middleware Implementation

```typescript
export const authMiddleware = async ({ headers, set }: Context) => {
  const token = headers.authorization?.replace('Bearer ', '');

  if (!token) {
    set.status = 401;
    return { error: 'Authentication required' };
  }

  // Token validation logic
};
```

## Database Best Practices

### SQLite Configuration

- Use WAL mode for better concurrent access
- Implement proper indexing for frequently queried fields
- Use foreign key constraints for data integrity
- Regular database maintenance and optimization

### Query Patterns

```typescript
// Use prepared statements for security
const stmt = db.prepare('SELECT * FROM recipes WHERE author_id = ?');
const recipes = stmt.all(authorId);

// Complex query with cuisine filtering
const getRecipesByCuisineStmt = db.prepare(`
  SELECT r.*, GROUP_CONCAT(c.name) as cuisines
  FROM recipes r
  LEFT JOIN recipe_cuisines rc ON r.id = rc.recipe_id
  LEFT JOIN cuisines c ON rc.cuisine_id = c.id
  WHERE rc.cuisine_id IN (${Array(cuisineIds.length).fill('?').join(',')})
  GROUP BY r.id
  ORDER BY r.created_at DESC
`);

// Get recipes grouped by cuisine for homepage
const getRecipesGroupedByCuisineStmt = db.prepare(`
  SELECT 
    c.id as cuisine_id,
    c.name as cuisine_name,
    COUNT(r.id) as recipe_count,
    JSON_GROUP_ARRAY(
      JSON_OBJECT(
        'id', r.id,
        'name', r.name,
        'description', r.description
      )
    ) as recipes
  FROM cuisines c
  LEFT JOIN recipe_cuisines rc ON c.id = rc.cuisine_id
  LEFT JOIN recipes r ON rc.recipe_id = r.id
  WHERE r.id IS NOT NULL
  GROUP BY c.id, c.name
  ORDER BY c.name ASC
`);

// Use transactions for data consistency
const insertRecipe = db.transaction(recipeData => {
  const recipe = insertRecipeStmt.run(recipeData);
  const recipeId = recipe.lastInsertRowid;

  // Insert steps
  recipeData.steps.forEach(step => {
    insertStepStmt.run({ ...step, recipe_id: recipeId });
  });

  // Insert cuisine associations
  recipeData.cuisines.forEach(cuisineId => {
    insertRecipeCuisineStmt.run({ recipe_id: recipeId, cuisine_id: cuisineId });
  });

  return recipeId;
});
```

### Database Schema Management

- Use migration files for schema changes
- Version control all database modifications
- Implement rollback strategies
- Document all schema changes

## File Upload & Management

### File Organization

```typescript
// Organize files by recipe ID
const uploadPath = `files/${recipeId}/`;
const filename = type === 'hero' ? 'hero.jpg' : `step-${stepNumber}.jpg`;
const fullPath = path.join(uploadPath, filename);
```

### File Validation

```typescript
const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

export const validateImageUpload = (file: File) => {
  if (!validImageTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxFileSize) {
    throw new Error('File too large');
  }
};
```

### File Security

- Validate file types and sizes
- Sanitize file names
- Implement rate limiting for uploads
- Use secure file serving with proper headers

## API Design Standards

### Response Format

```typescript
// Consistent response structure
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Error Handling

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

// Global error handler
app.onError(({ error, set }) => {
  if (error instanceof ApiError) {
    set.status = error.statusCode;
    return { success: false, error: error.message, code: error.code };
  }

  set.status = 500;
  return { success: false, error: 'Internal server error' };
});
```

### Input Validation

```typescript
import { t } from 'elysia';

const createRecipeSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  description: t.String({ maxLength: 1000 }),
  cuisines: t.Array(t.String()), // Array of cuisine IDs
  ingredients: t.Array(
    t.Object({
      name: t.String(),
      quantity: t.Number({ minimum: 0 }),
      unit: t.String(),
    })
  ),
  steps: t.Array(
    t.Object({
      step_number: t.Number({ minimum: 1 }),
      instruction: t.String({ minLength: 1 }),
    })
  ),
});

const createCuisineSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 50 }),
  description: t.Optional(t.String({ maxLength: 500 })),
});

const recipeFilterSchema = t.Object({
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
```

## Performance Optimization

### Database Optimization

- Use appropriate indexes for query patterns
- Implement connection pooling
- Use prepared statements for repeated queries
- Monitor query performance and optimize slow queries

### Caching Strategy

- Implement in-memory caching for frequently accessed data
- Use ETags for HTTP caching
- Cache database query results when appropriate
- Implement cache invalidation strategies

### File Serving

- Use efficient file streaming for large files
- Implement proper HTTP caching headers
- Consider CDN integration for production
- Optimize image sizes and formats

## Testing Standards

### Unit Testing

```typescript
import { describe, it, expect } from 'bun:test';

describe('Recipe Service', () => {
  it('should create recipe with valid data', async () => {
    const recipeData = {
      name: 'Test Recipe',
      description: 'Test description',
      author_id: 'user-1',
    };

    const recipe = await recipeService.create(recipeData);
    expect(recipe.name).toBe('Test Recipe');
  });
});
```

### Integration Testing

- Test complete API endpoints
- Verify database interactions
- Test file upload functionality
- Validate error handling scenarios

### Test Database

- Use separate test database
- Implement test data fixtures
- Clean up test data after each test
- Mock external dependencies

## Security Best Practices

### Input Validation

- Validate all input data
- Sanitize user inputs
- Use parameterized queries
- Implement rate limiting

### Authentication & Authorization

- Use secure token-based authentication
- Implement proper session management
- Validate user permissions for operations
- Log security-related events

### File Security

- Validate uploaded file types
- Scan for malicious content
- Implement secure file storage
- Use proper file permissions

## Environment Configuration

### Environment Variables

```typescript
const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || './recipes.db',
  jwtSecret: process.env.JWT_SECRET,
  uploadDir: process.env.UPLOAD_DIR || './files',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Development vs Production

- Use different configurations for environments
- Implement proper logging levels
- Use environment-specific database settings
- Configure CORS appropriately

## Code Quality

### Formatting & Linting

```json
// .eslintrc.json
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error"
  }
}
```

### Type Safety

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type usage
- Implement proper error types

## File Naming Conventions

### Files & Directories

- Use kebab-case for file and directory names
- Use PascalCase for React component files
- Use camelCase for utility functions and hooks
- Include appropriate file extensions (.tsx, .ts, .css, etc.)

### Examples

```
components/recipe-card.tsx
lib/api-client.ts
hooks/use-recipes.ts
types/recipe.ts
```

## Git Workflow

### Commit Standards

- Use conventional commit format: `type(scope): description`
- Write clear, descriptive commit messages
- Keep commits small and focused
- Use meaningful branch names

### Branch Strategy

- Use feature branches for new development
- Follow naming convention: `feature/description`
- Create pull requests for code review
- Merge only after review and CI checks pass

## Environment Configuration

### Development Setup

- Use environment variables for configuration
- Maintain separate configs for development/production
- Document all required environment variables
- Use TypeScript for environment variable validation
