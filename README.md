# Backend
The Backend of Lambda L.A.P Project

## Stack
- **Node.js** with **TypeScript** (Strict mode, ES2020+)
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **Jest** & **Supertest** - Testing framework
- **ESLint** (Standard) & **Prettier** - Code quality
- **Husky** - Git hooks for pre-commit linting

## Project Structure
```
src/
├── __tests__/          # Test files
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middlewares/        # Express middlewares
├── routes/             # Route definitions
├── services/           # Business logic
├── utils/              # Utility functions
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance

### Installation
```bash
npm install
```

### Configuration
Update the `.env` file with your MongoDB connection string:
```
DATABASE_URL="mongodb+srv://..."
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

## Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

## API Endpoints

### Health Check
- **GET** `/api/v1/health`
  - Returns server health status
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "status": "healthy",
        "timestamp": "2024-12-03T17:00:00.000Z"
      }
    }
    ```

## JSend Response Format
All API responses follow the JSend format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Testing
Tests are written using Jest and Supertest. Run tests with:
```bash
npm test
```

## Code Quality
- **Pre-commit hooks** automatically run linting and formatting
- **ESLint** with Standard configuration
- **Prettier** for consistent code formatting
- **TypeScript strict mode** for type safety

## License
ISC
