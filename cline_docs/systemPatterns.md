# System Patterns

## Architecture Overview
The datetime MCP tool follows a modular architecture with clear separation of concerns:

```
src/
├── index.ts         # MCP server entry point and tool definitions
├── types.ts         # TypeScript interfaces and type definitions
└── utils/
    └── datetime.ts  # Core datetime manipulation functionality
```

## Key Technical Decisions

### 1. MCP Server Implementation
- Uses @modelcontextprotocol/sdk for MCP server functionality
- Implements standard MCP tool patterns for consistent interface
- Handles errors gracefully with proper error codes and messages

### 2. DateTime Operations
- Uses native JavaScript Date object for core functionality
- Leverages Intl API for locale-aware formatting
- System timezone integration for accurate local time

### 3. Type Safety
- Full TypeScript implementation
- Strong typing for all interfaces and functions
- Runtime type validation for input parameters

### 4. Error Handling
- Comprehensive error types
- Detailed error messages
- Proper error propagation

## Design Patterns

### Tool Interface Pattern
Each datetime tool follows a consistent pattern:
```typescript
{
  name: string;          // Tool identifier
  description: string;   // Human-readable description
  inputSchema: {         // JSON Schema for parameters
    type: "object",
    properties: {...},
    required: [...]
  }
}
```

### Error Handling Pattern
```typescript
try {
  // Operation
} catch (error) {
  throw new McpError(
    ErrorCode.InvalidParams,
    `Detailed error message: ${error.message}`
  );
}
```

## Best Practices
1. All dates handled in ISO 8601 format
2. Timezone-aware operations by default
3. Immutable date operations
4. Comprehensive input validation
5. Clear error messages
