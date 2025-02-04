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
import { TimeUnit, DateTimeFormat } from './types.js';

class DateTimeServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'datetime',
        version: '0.1.0',
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
          name: 'get_current_time',
          description: 'Get current time in system timezone with optional formatting',
          inputSchema: {
            type: 'object',
            properties: {
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
            }
          }
        },
        {
          name: 'add_time',
          description: 'Add a time unit to a date',
          inputSchema: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              timeUnit: {
                type: 'object',
                properties: {
                  value: { type: 'number' },
                  unit: { 
                    type: 'string',
                    enum: ['years', 'months', 'days', 'hours', 'minutes', 'seconds']
                  }
                },
                required: ['value', 'unit']
              }
            },
            required: ['date', 'timeUnit']
          }
        },
        {
          name: 'subtract_time',
          description: 'Subtract a time unit from a date',
          inputSchema: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              timeUnit: {
                type: 'object',
                properties: {
                  value: { type: 'number' },
                  unit: { 
                    type: 'string',
                    enum: ['years', 'months', 'days', 'hours', 'minutes', 'seconds']
                  }
                },
                required: ['value', 'unit']
              }
            },
            required: ['date', 'timeUnit']
          }
        },
        {
          name: 'get_day_info',
          description: 'Get detailed information about a specific date',
          inputSchema: {
            type: 'object',
            properties: {
              date: { type: 'string' }
            },
            required: ['date']
          }
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_current_time': {
          const format = request.params.arguments?.format as DateTimeFormat | undefined;
          const result = DateTimeUtils.getCurrentTime(format);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        case 'add_time': {
          const args = request.params.arguments;
          if (!args) {
            throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
          }
          const { date, timeUnit } = args as { date: string; timeUnit: TimeUnit };
          if (!DateTimeUtils.validateDate(date)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid date format');
          }
          if (!DateTimeUtils.validateTimeUnit(timeUnit)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid time unit');
          }
          const result = DateTimeUtils.addTime(date, timeUnit as TimeUnit);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        case 'subtract_time': {
          const args = request.params.arguments;
          if (!args) {
            throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
          }
          const { date, timeUnit } = args as { date: string; timeUnit: TimeUnit };
          if (!DateTimeUtils.validateDate(date)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid date format');
          }
          if (!DateTimeUtils.validateTimeUnit(timeUnit)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid time unit');
          }
          const result = DateTimeUtils.subtractTime(date, timeUnit as TimeUnit);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        case 'get_day_info': {
          const args = request.params.arguments;
          if (!args) {
            throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
          }
          const { date } = args as { date: string };
          if (!DateTimeUtils.validateDate(date)) {
            throw new McpError(ErrorCode.InvalidParams, 'Invalid date format');
          }
          const result = DateTimeUtils.getDayInfo(date);
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
