# DateTime MCP Server

A Model Context Protocol (MCP) server that provides powerful datetime manipulation tools with timezone support, time calculations, and persistent timer functionality.

## Tools

### 1. get_time

Get time information with optional formatting and timezone support.

```typescript
{
  timezone?: string;    // IANA timezone identifier (e.g., "America/New_York")
  date?: string;        // ISO date string, defaults to current time
  format?: {
    style?: 'full' | 'long' | 'medium' | 'short';
    weekday?: 'long' | 'short' | 'narrow';
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    day?: 'numeric' | '2-digit';
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
    second?: 'numeric' | '2-digit';
  };
  info?: boolean;       // Include additional day information
}
```

Example:
```json
{
  "timezone": "America/New_York",
  "format": {
    "style": "full",
    "weekday": "long"
  },
  "info": true
}
```

### 2. calculate_time

Perform time calculations with timezone support.

```typescript
{
  date: string;         // ISO date string to perform calculation on
  operation: 'add' | 'subtract';
  amount: number;       // Amount of units to add/subtract
  unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds';
  timezone?: string;    // IANA timezone identifier
  format?: DateTimeFormat;
}
```

Example:
```json
{
  "date": "2025-02-03T23:26:35.689Z",
  "operation": "add",
  "amount": 2,
  "unit": "days",
  "timezone": "America/New_York",
  "format": {
    "style": "full",
    "weekday": "long"
  }
}
```

### 3. timer

Stopwatch functionality with persistence across sessions.

```typescript
{
  action: 'start' | 'stop' | 'delete';
  id?: string;         // Optional timer identifier for multiple timers
  description?: string;// Optional description of what the timer is tracking
  format?: {
    includeMilliseconds?: boolean;
    style?: 'compact' | 'verbose'; // "1:23:45" vs "1 hour, 23 minutes, 45 seconds"
  };
}
```

Example:
```json
{
  "action": "start",
  "id": "task-timer",
  "description": "Time spent on task",
  "format": {
    "style": "verbose",
    "includeMilliseconds": true
  }
}
```

## Features

- Timezone-aware time operations
- Flexible date/time formatting options
- Detailed day information (week number, day of year, etc.)
- Time calculations in various units
- Persistent timer functionality
- Multiple concurrent named timers
- Timer state persistence across sessions
- Clean timer resource management with deletion support

## Implementation Details

- Timer states are stored in a JSON file for persistence
- All times are handled in UTC internally
- Timezone conversions use the IANA timezone database
- Timer precision includes milliseconds
- Timer state file is automatically created when needed

## Error Handling

The server includes comprehensive error handling for:
- Invalid dates
- Invalid timezones
- Missing required parameters
- Timer state management errors
- Non-existent or already stopped timers

## Usage Examples

1. Get current time in New York with day info:
```json
{
  "timezone": "America/New_York",
  "format": { "style": "full" },
  "info": true
}
```

2. Add 3 months to a date:
```json
{
  "date": "2025-01-01T00:00:00Z",
  "operation": "add",
  "amount": 3,
  "unit": "months"
}
```

3. Start a named timer:
```json
{
  "action": "start",
  "id": "project-a",
  "description": "Time spent on Project A"
}
```

4. Stop and get elapsed time:
```json
{
  "action": "stop",
  "id": "project-a",
  "format": {
    "style": "verbose",
    "includeMilliseconds": true
  }
}
```

5. Delete a timer:
```json
{
  "action": "delete",
  "id": "project-a"
}
