# Technical Context

## Technologies Used

### Core Technologies
- TypeScript 5.0+
- Node.js
- Model Context Protocol SDK v1.4.1

### Development Tools
- npm for package management
- tsc (TypeScript compiler)

## Development Setup
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run dev

# Start the server
npm start
```

## Technical Constraints

### Runtime Requirements
- Node.js environment
- File system access for timer persistence
- System timezone access

### Dependencies
- @modelcontextprotocol/sdk: ^1.4.1
- @types/node: ^20.0.0
- typescript: ^5.0.0

### Type System
- Strict TypeScript configuration
- Comprehensive type definitions for all features
- Type-safe MCP tool interfaces

### File Persistence
- Requires write access to working directory for timer state
- Uses JSON for data storage
- Handles concurrent access to timer state file

### Date/Time Handling
- Relies on JavaScript Date object capabilities
- Uses Intl API for formatting and timezone support
- All times stored internally as UTC
