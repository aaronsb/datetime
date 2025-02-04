#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { DateTimeUtils } from './utils/datetime.js';
import { TimeUnit, DateTimeFormat, TimerFormat } from './types.js';

class DateTimeServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'datetime',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_time',
          description: 'Get time information with optional formatting and timezone support',
          inputSchema: {
            type: 'object',
            properties: {
              timezone: {
                type: 'string',
                description: 'IANA timezone identifier (e.g., "America/New_York")'
              },
              date: {
                type: 'string',
                description: 'ISO date string. Defaults to current time if not provided'
              },
              format: {
                type: 'object',
                properties: {
                  style: { type: 'string', enum: ['full', 'long', 'medium', 'short'] },
                  weekday: { type: 'string', enum: ['long', 'short', 'narrow'] },
                  year: { type: 'string', enum: ['numeric', '2-digit'] },
                  month: { type: 'string', enum: ['numeric', '2-digit', 'long', 'short', 'narrow'] },
                  day: { type: 'string', enum: ['numeric', '2-digit'] },
                  hour: { type: 'string', enum: ['numeric', '2-digit'] },
                  minute: { type: 'string', enum: ['numeric', '2-digit'] },
                  second: { type: 'string', enum: ['numeric', '2-digit'] }
                }
              },
              info: {
                type: 'boolean',
                description: 'Include additional day information like week number, day of year, etc.'
              }
            }
          }
        },
        {
          name: 'calculate_time',
          description: 'Perform time calculations with timezone support',
          inputSchema: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'ISO date string to perform calculation on'
              },
              operation: {
                type: 'string',
                enum: ['add', 'subtract'],
                description: 'Whether to add or subtract the time unit'
              },
              amount: {
                type: 'number',
                description: 'Amount of units to add or subtract'
              },
              unit: {
                type: 'string',
                enum: ['years', 'months', 'days', 'hours', 'minutes', 'seconds'],
                description: 'Time unit for calculation'
              },
              timezone: {
                type: 'string',
                description: 'IANA timezone identifier (e.g., "America/New_York")'
              },
              format: {
                type: 'object',
                properties: {
                  style: { type: 'string', enum: ['full', 'long', 'medium', 'short'] },
                  weekday: { type: 'string', enum: ['long', 'short', 'narrow'] },
                  year: { type: 'string', enum: ['numeric', '2-digit'] },
                  month: { type: 'string', enum: ['numeric', '2-digit', 'long', 'short', 'narrow'] },
                  day: { type: 'string', enum: ['numeric', '2-digit'] },
                  hour: { type: 'string', enum: ['numeric', '2-digit'] },
                  minute: { type: 'string', enum: ['numeric', '2-digit'] },
                  second: { type: 'string', enum: ['numeric', '2-digit'] }
                }
              }
            },
            required: ['date', 'operation', 'amount', 'unit']
          }
        },
        {
          name: 'timer',
          description: 'Stopwatch functionality with persistence across sessions',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['start', 'stop', 'delete'],
                description: 'Whether to start or stop the timer'
              },
              id: {
                type: 'string',
                description: 'Optional timer identifier for multiple concurrent timers'
              },
              description: {
                type: 'string',
                description: 'Optional description of what the timer is tracking'
              },
              format: {
                type: 'object',
                properties: {
                  includeMilliseconds: {
                    type: 'boolean',
                    description: 'Include milliseconds in the formatted output'
                  },
                  style: {
                    type: 'string',
                    enum: ['compact', 'verbose'],
                    description: 'Output style (e.g., "1:23:45" vs "1 hour, 23 minutes, 45 seconds")'
                  }
                }
              }
            },
            required: ['action']
          }
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_time': {
            const result = DateTimeUtils.getTime(request.params.arguments || {});
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'calculate_time': {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required arguments');
            }
            const args = request.params.arguments as {
              date: string;
              operation: 'add' | 'subtract';
              amount: number;
              unit: TimeUnit;
              timezone?: string;
              format?: DateTimeFormat;
            };
            const result = DateTimeUtils.calculateTime(args);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'timer': {
            if (!request.params.arguments?.action) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required action parameter');
            }
            const args = request.params.arguments as {
              action: 'start' | 'stop' | 'delete';
              id?: string;
              description?: string;
              format?: TimerFormat;
            };
            const result = await DateTimeUtils.handleTimer(args);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DateTime MCP server running on stdio');
  }
}

const server = new DateTimeServer();
server.run().catch(console.error);
