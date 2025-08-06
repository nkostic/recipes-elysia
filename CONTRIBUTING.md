# Contributing to Recipe API

Thank you for considering contributing to the Recipe API! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

We welcome contributions of all kinds, including:

- 🐛 Bug reports and fixes
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🧪 Tests and test improvements
- 🎨 UI/UX improvements
- 🔧 Code refactoring and optimization

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Node.js >= 18.0.0 (for compatibility)
- SQLite3

### Local Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/recipes-elysia.git
   cd recipes-elysia
   ```

2. **Install Dependencies**

   ```bash
   bun install
   ```

3. **Set Up Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start Development Server**

   ```bash
   bun run dev
   ```

5. **Verify Setup**
   - API: http://localhost:3000
   - Documentation: http://localhost:3000/docs

## 📝 Development Guidelines

### Code Style

We use ESLint and Prettier for consistent code formatting:

```bash
# Check linting
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format
```

### Architecture

The project follows MVC architecture:

```
src/
├── controllers/     # Business logic
├── models/         # Data models and database
├── routes/         # API routes
├── middleware/     # Custom middleware
├── validators/     # Input validation schemas
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
```

### Coding Standards

- **TypeScript**: Use strict typing, avoid `any`
- **Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Comments**: Write clear, concise comments for complex logic
- **Functions**: Keep functions small and focused (single responsibility)
- **Error Handling**: Always handle errors gracefully
- **Security**: Never commit sensitive data (passwords, keys, etc.)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/tests/auth.test.ts
```

### Writing Tests

- Write tests for all new features
- Maintain or improve test coverage
- Use descriptive test names
- Test both success and error cases

Example test structure:

```typescript
describe('AuthController', () => {
  describe('register', () => {
    it('should create a new user with valid data', async () => {
      // Test implementation
    });

    it('should reject registration with invalid email', async () => {
      // Test implementation
    });
  });
});
```

## 📤 Pull Request Process

### Before Submitting

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Run Quality Checks**

   ```bash
   bun run lint
   bun run format
   bun test
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add user profile management"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding or updating tests
- `chore:` maintenance tasks

Examples:

```
feat: add password reset functionality
fix: resolve JWT token expiration issue
docs: update API documentation for auth endpoints
```

### Pull Request Template

When creating a PR, please include:

- **Description**: Clear description of what changes were made
- **Type**: Feature, bugfix, documentation, etc.
- **Testing**: How the changes were tested
- **Screenshots**: If applicable
- **Breaking Changes**: Any breaking changes
- **Related Issues**: Link to related issues

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Bun version, Node version
- **Steps to Reproduce**: Clear steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Error Messages**: Any error messages or logs
- **Screenshots**: If applicable

Use this template:

```markdown
## Bug Description

Brief description of the bug

## Environment

- OS: macOS 14.0
- Bun: 1.0.0
- Node: 18.0.0

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

## Expected Behavior

Description of expected behavior

## Actual Behavior

Description of actual behavior

## Error Messages
```

Any error messages or logs

```

## Screenshots
[Attach screenshots if applicable]
```

## 💡 Feature Requests

For feature requests, please:

1. **Check Existing Issues**: Search for similar requests
2. **Provide Context**: Explain the use case and problem
3. **Describe Solution**: Suggest a solution if you have one
4. **Consider Alternatives**: Mention alternative solutions

## 📜 Code of Conduct

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome contributors of all backgrounds
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Remember that everyone is learning

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Offensive comments or personal attacks
- Spam or off-topic discussions
- Publishing private information without permission

## 🎉 Recognition

Contributors will be recognized in:

- **README.md**: Contributors section
- **Release Notes**: Acknowledgment in release notes
- **GitHub**: Contributor graphs and statistics

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: nenad@example.com (replace with actual email)

## 📚 Additional Resources

- [Elysia Documentation](https://elysiajs.com/)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

---

Thank you for contributing to Recipe API! 🍳✨

**Author**: Nenad Kostic  
**License**: MIT  
**Repository**: https://github.com/nkostic/recipes-elysia
