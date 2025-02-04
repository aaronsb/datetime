# Product Context

## Purpose
The datetime MCP server provides datetime manipulation and timer functionality through a Model Context Protocol interface. It serves as a utility server that other applications can use to handle various time-related operations.

## Problems Solved
1. Standardized datetime operations across different timezones
2. Flexible date/time formatting
3. Time calculations (add/subtract units of time)
4. Persistent timer functionality for tracking elapsed time

## Expected Functionality
The server provides three main tools:

1. get_time
- Retrieve formatted time information
- Support for different timezones
- Optional additional day information (week number, day of year, etc.)

2. calculate_time
- Add or subtract time units (years, months, days, hours, minutes, seconds)
- Timezone support
- Flexible output formatting

3. timer
- Start/stop/delete timer functionality
- Support for multiple concurrent timers
- Persistent state across sessions
- Flexible time formatting (compact/verbose)
