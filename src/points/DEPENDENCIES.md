# Unified Points System - Dependencies

## Required Dependencies

The following dependencies are required for the Unified Points System:

### Already Installed
- `@supabase/supabase-js` - Supabase client
- `react` - React framework
- `react-dom` - React DOM
- `typescript` - TypeScript support

### Need to Install

```bash
npm install uuid fast-check
# or
yarn add uuid fast-check
```

#### uuid
- **Version**: ^9.0.0
- **Purpose**: Generate unique IDs for operations and transactions
- **Usage**: `import { v4 as uuidv4 } from 'uuid'`

#### fast-check
- **Version**: ^3.13.0
- **Purpose**: Property-based testing framework
- **Usage**: For writing property-based tests
- **Dev Dependency**: Can be installed as devDependency

### Optional Dev Dependencies

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest ts-jest
```

- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - Jest DOM matchers
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest

## Installation Steps

1. Install required dependencies:
```bash
npm install uuid fast-check
```

2. Install dev dependencies (for testing):
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest ts-jest
```

3. Update `tsconfig.json` if needed to include test files:
```json
{
  "compilerOptions": {
    "types": ["jest", "@testing-library/jest-dom"]
  }
}
```

4. Create `jest.config.js` if not exists:
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
```

## Verification

After installation, verify dependencies are available:

```bash
npm list uuid fast-check
```

Should output something like:
```
├── uuid@9.0.0
└── fast-check@3.13.0
```

## Notes

- All dependencies are production-ready and widely used
- `uuid` is lightweight and has no external dependencies
- `fast-check` is the standard property-based testing library for JavaScript
- The system is designed to work with existing Supabase configuration
