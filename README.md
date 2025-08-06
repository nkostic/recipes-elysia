# Recipe API Backend

A modern recipe management API built with Elysia framework and Bun runtime, featuring SQLite database and comprehensive cuisine support.

## 🚀 Features

- **Modern Stack**: Built with Elysia, Bun, TypeScript, and SQLite
- **Comprehensive Recipe Management**: CRUD operations with dynamic steps and ingredients
- **Cuisine Organization**: Support for multiple cuisines per recipe with grouping capabilities
- **File Upload**: Hero photos and step-by-step photos for recipes
- **Advanced Filtering**: Sort and filter recipes by cuisine, author, ingredients, and more
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Type Safety**: Full TypeScript support with strict type checking
- **Performance**: Optimized database queries with proper indexing

## 📋 API Endpoints

### Recipe Management

- `GET /api/v1/recipes` - List recipes with filtering and sorting
- `GET /api/v1/recipes/:id` - Get single recipe with full details
- `POST /api/v1/recipes` - Create new recipe
- `PUT /api/v1/recipes/:id` - Update existing recipe
- `DELETE /api/v1/recipes/:id` - Archive recipe
- `GET /api/v1/recipes/by-cuisine/:cuisineId` - Get recipes by specific cuisine
- `GET /api/v1/recipes/grouped-by-cuisine` - Get recipes grouped by cuisine

### Cuisine Management

- `GET /api/v1/cuisines` - List all available cuisines
- `GET /api/v1/cuisines/:id` - Get single cuisine with details
- `POST /api/v1/cuisines` - Create new cuisine
- `PUT /api/v1/cuisines/:id` - Update existing cuisine
- `DELETE /api/v1/cuisines/:id` - Delete cuisine

### File Upload

- `POST /api/v1/recipes/:id/photos/hero` - Upload hero photo
- `POST /api/v1/recipes/:id/photos/steps/:stepNumber` - Upload step photo
- `GET /api/v1/files/:recipeId/:filename` - Serve uploaded photos

## 🛠 Installation

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd recipes-elysia
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Initialize database and seed data**

   ```bash
   bun run seed
   ```

5. **Start development server**
   ```bash
   bun run dev
   ```

The API will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/docs`

## 🗄 Database Schema

The application uses SQLite with the following tables:

- **users** - User management
- **cuisines** - Cuisine categories
- **recipes** - Recipe information
- **recipe_cuisines** - Many-to-many relationship between recipes and cuisines
- **recipe_steps** - Step-by-step instructions
- **ingredients** - Ingredient catalog
- **recipe_ingredients** - Recipe ingredients with quantities

## 📁 Project Structure

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
docs/                   # Documentation
├── INSTRUCTIONS.md     # Project requirements
└── CODE_STANDARDS.md   # Coding standards
```

## 🚀 Available Scripts

- `bun run dev` - Start development server with auto-reload
- `bun run start` - Start production server
- `bun run seed` - Seed database with sample data
- `bun run test` - Run tests
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run build` - Build for production
- `bun run typecheck` - Run TypeScript type checking

## 🔧 Configuration

### Environment Variables

| Variable        | Description                | Default                 |
| --------------- | -------------------------- | ----------------------- |
| `PORT`          | Server port                | `3000`                  |
| `NODE_ENV`      | Environment                | `development`           |
| `DATABASE_URL`  | SQLite database path       | `./recipes.db`          |
| `JWT_SECRET`    | JWT signing secret         | Required in production  |
| `UPLOAD_DIR`    | File upload directory      | `./files`               |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `5242880` (5MB)         |
| `FRONTEND_URL`  | Frontend URL for CORS      | `http://localhost:3000` |

## 🎯 Key Features

### Recipe Organization

- **Multi-cuisine Support**: Each recipe can belong to multiple cuisines
- **Dynamic Steps**: Variable number of instruction steps with ordering
- **Ingredient Management**: Automatic ingredient catalog with quantities and units
- **Photo Support**: Hero photos and step-specific photos

### Advanced Filtering

- Sort by: name, created_at, updated_at, author, cuisine
- Filter by: author_id, ingredients, cuisines, created date range
- Search: recipe name, description, ingredients, cuisine name
- Pagination: Efficient handling of large datasets

### Performance Features

- **Database Optimization**: Proper indexing and query optimization
- **File Management**: Organized file structure with efficient serving
- **Caching**: HTTP caching headers for static files
- **Type Safety**: Full TypeScript coverage

## 📚 API Documentation

Interactive API documentation is automatically generated and available at `/docs` when the server is running.

## 🔐 Security

- Input validation and sanitization
- File upload security (type and size validation)
- CORS configuration
- SQL injection prevention with prepared statements
- Rate limiting support

## 🧪 Testing

Run tests with:

```bash
bun run test
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📞 Support

For questions or issues, please open an issue on the repository.
