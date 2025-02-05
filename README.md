# datetime-mcp

An MCP (Model Context Protocol) server that provides powerful datetime manipulation and timer functionality. This server enables standardized datetime operations, flexible formatting, time calculations, and persistent timer tracking across different timezones.

## Features

- **Time Information**
  - Retrieve formatted time information
  - Support for different timezones
  - Optional day information (week number, day of year, etc.)

- **Time Calculations**
  - Add or subtract time units
  - Support for years, months, days, hours, minutes, seconds
  - Timezone-aware calculations
  - Flexible output formatting

- **Timer Functionality**
  - Start/stop/delete operations
  - Support for multiple concurrent timers
  - Persistent state across sessions
  - Configurable time formatting (compact/verbose)

## Installation

### Standard Installation

```bash
# Clone the repository
git clone [repository-url]
cd datetime-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Docker Installation

You can run this server using Docker in two ways:

#### 1. Pull from GitHub Container Registry

```bash
# Pull the latest version
docker pull ghcr.io/aaronsb/datetime:latest

# Run the container
docker run -it --rm ghcr.io/aaronsb/datetime
```

#### 2. Build Locally

```bash
# Build the image
docker build -t datetime-mcp .

# Run the container
docker run -it --rm datetime-mcp
```

The Docker image:
- Is automatically built and tested via GitHub Actions
- Tagged with both latest and commit-specific versions
- Available on GitHub Container Registry (ghcr.io)

Note: To access the GitHub Container Registry:
1. Go to repository settings
2. Navigate to Actions > General
3. Enable "Read and write permissions" under "Workflow permissions"

## Usage

Start the server:

```bash
npm start
```

The server provides three main tools through the MCP interface:

### 1. get_time
```typescript
// Get current time in New York
{
  "timezone": "America/New_York",
  "format": {
    "style": "full"
  },
  "info": true
}
```

### 2. calculate_time
```typescript
// Add 2 days to a date
{
  "date": "2025-02-04T00:00:00Z",
  "operation": "add",
  "amount": 2,
  "unit": "days",
  "timezone": "UTC"
}
```

### 3. timer
```typescript
// Start a new timer
{
  "action": "start",
  "id": "my-timer",
  "description": "Task timer",
  "format": {
    "style": "verbose"
  }
}
```

## Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Start in watch mode
npm run dev
```

### Testing

The project uses Jest for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Technical Details

- Built with TypeScript 5.0+
- Uses Node.js runtime
- Implements Model Context Protocol SDK v1.4.1
- Strict TypeScript configuration
- File system persistence for timer state
- Comprehensive test coverage

## Requirements

- Node.js environment
- File system access (for timer persistence)
- System timezone access

## Dependencies

- @modelcontextprotocol/sdk: ^1.4.1
- TypeScript and Node.js type definitions
- Development tools: Jest, mock-fs

## License

See [LICENSE](LICENSE) file for details.
