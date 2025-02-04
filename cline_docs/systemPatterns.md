# System Patterns

## Architecture
- Built using TypeScript and the Model Context Protocol SDK
- Follows a modular design with clear separation of concerns
- Uses class-based architecture for organization and encapsulation

## Key Components

### DateTimeServer Class
- Main server class that initializes MCP server and sets up tool handlers
- Handles tool registration and request routing
- Implements error handling and graceful shutdown

### DateTimeUtils Class
- Static utility class containing core datetime functionality
- Handles all datetime calculations and formatting
- Manages persistent timer state

## Technical Decisions

### Timezone Handling
- Uses built-in JavaScript Intl API for robust timezone support
- Defaults to system timezone when not specified
- Supports IANA timezone identifiers

### Date Formatting
- Leverages Intl.DateTimeFormat for localized formatting
- Supports multiple format styles (full, long, medium, short)
- Flexible configuration for date/time components

### Timer Implementation
- File-based persistence using JSON storage
- Supports concurrent timers through unique IDs
- Maintains timer state between server restarts
- Handles both compact and verbose time formatting

## Error Handling
- Comprehensive error handling using MCP error codes
- Input validation for all tool parameters
- Graceful handling of invalid dates and operations

## File Structure
```
src/
├── index.ts          # Main server implementation
├── types.ts          # TypeScript type definitions
└── utils/
    └── datetime.ts   # Core datetime utilities
