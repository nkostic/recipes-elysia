# Recipe API Backend Instructions

## Project Overview

This is the backend API for the recipe management system, built with Elysia framework running on Bun runtime. The API serves recipe data and handles file uploads for a frontend application.

## Core Features

### API Endpoints

- **Create Recipe**: POST endpoint to create new recipes with ingredients and steps
- **Update Recipe**: PUT endpoint to update existing recipes
- **Archive Recipe**: DELETE/PATCH endpoint to archive recipes
- **List Recipes**: GET endpoint with sorting and filtering capabilities
- **File Upload**: Handle photo uploads for hero images and step photos

### Recipe Data Management

- **Recipe CRUD**: Full create, read, update, archive operations
- **Dynamic Steps**: Support variable number of recipe steps with ordering
- **Ingredients Management**: Handle recipe ingredients with quantities and units
- **User Management**: Track recipe authors and modification history
- **File Organization**: Store uploaded photos organized by recipe ID

## Technical Requirements

### Backend Stack

- **Elysia**: Modern TypeScript web framework
- **Bun**: JavaScript runtime for high performance
- **SQLite**: Lightweight database for recipe storage
- **TypeScript**: Type-safe development throughout

### Database Schema

#### Users Table

```sql
users
├── id (UUID, PK) - User ID
├── name (TEXT) - Display name
├── email (TEXT, unique) - Email address
└── created_at (TIMESTAMP) - User created timestamp
```

#### Cuisines Table

```sql
cuisines
├── id (UUID, PK) - Cuisine ID
├── name (TEXT, unique) - Cuisine name (e.g., Italian, Chinese, Mexican)
├── description (TEXT) - Description of the cuisine
└── created_at (TIMESTAMP) - When the cuisine was created
```

#### Recipes Table

```sql
recipes
├── id (UUID, PK) - Recipe ID
├── name (TEXT) - Recipe name
├── description (TEXT) - Description of the recipe
├── author_id (UUID, FK → users.id) - Author of the recipe
├── created_at (TIMESTAMP) - When the recipe was created
├── updated_at (TIMESTAMP) - When the recipe was last updated
├── created_by (UUID, FK → users.id) - Who created the record
└── updated_by (UUID, FK → users.id) - Who last updated it
```

#### Recipe Cuisines Table

```sql
recipe_cuisines
├── id (UUID, PK) - ID for this specific association
├── recipe_id (UUID, FK → recipes.id) - The recipe
└── cuisine_id (UUID, FK → cuisines.id) - Cuisine reference
```

#### Recipe Steps Table

```sql
recipe_steps
├── id (UUID, PK) - Step ID
├── recipe_id (UUID, FK → recipes.id) - Which recipe it belongs to
├── step_number (INT) - Order of step (1, 2, 3...)
└── instruction (TEXT) - Step text
```

#### Ingredients Table

```sql
ingredients
├── id (UUID, PK) - Ingredient ID
└── name (TEXT) - Ingredient name (e.g., Flour)
```

#### Recipe Ingredients Table

```sql
recipe_ingredients
├── id (UUID, PK) - ID for this specific association
├── recipe_id (UUID, FK → recipes.id) - The recipe
├── ingredient_id (UUID, FK → ingredients.id) - Ingredient reference
├── quantity (DECIMAL) - Amount (e.g., 1.5)
└── unit (TEXT) - Unit (e.g., "cup", "tbsp")
```

### File Management

- **Upload Directory**: `files/` folder in project root
- **Organization**: Photos grouped by recipe ID (`files/{recipe-id}/`)
- **File Types**: Support common image formats (jpg, png, webp)
- **Naming**: Systematic naming for hero and step photos

### API Endpoints Specification

#### Recipe Management

- `GET /recipes` - List recipes with filtering and sorting
- `GET /recipes/:id` - Get single recipe with full details
- `POST /recipes` - Create new recipe
- `PUT /recipes/:id` - Update existing recipe
- `DELETE /recipes/:id` - Archive recipe
- `GET /recipes/by-cuisine/:cuisineId` - Get recipes by specific cuisine
- `GET /recipes/grouped-by-cuisine` - Get recipes grouped by cuisine for homepage

#### Cuisine Management

- `GET /cuisines` - List all available cuisines
- `GET /cuisines/:id` - Get single cuisine with details
- `POST /cuisines` - Create new cuisine
- `PUT /cuisines/:id` - Update existing cuisine
- `DELETE /cuisines/:id` - Delete cuisine

#### File Upload

- `POST /recipes/:id/photos/hero` - Upload hero photo
- `POST /recipes/:id/photos/steps/:stepNumber` - Upload step photo
- `GET /files/:recipeId/:filename` - Serve uploaded photos

#### Filtering & Sorting

- Sort by: name, created_at, updated_at, author, cuisine
- Filter by: author_id, ingredients, cuisines, created date range
- Group by: cuisine (for homepage display)
- Search by: recipe name, description, ingredients, cuisine name
- Pagination support for large datasets

### Cuisine Features

#### Homepage Grouping

- Display recipes grouped by cuisine for easy browsing
- Show cuisine name and count of recipes per cuisine
- Allow expansion/collapse of cuisine groups

#### Recipe-Cuisine Relationship

- Each recipe can be associated with one or multiple cuisines
- Support for complex cuisine combinations (e.g., "Asian Fusion", "Italian-American")
- Cuisine filtering and search capabilities
- Responsive design for mobile and desktop
- Clean, intuitive user interface

## User Experience Goals

- Simple and intuitive interface
- Fast recipe browsing and searching
- Easy recipe creation and editing
- Clear step-by-step instructions with visual aids
- Mobile-friendly responsive design
