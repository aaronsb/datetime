#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js';

class DateTimeServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'datetime-server',
        version: '1.0.0',
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
          description: 'Get the current time in a specified timezone',
          inputSchema: {
            type: 'object',
            properties: {
              timezone: {
                type: 'string',
                description: 'IANA timezone identifier (e.g., "America/New_York")',
              },
              format: {
                type: 'string',
                description: 'Optional datetime format string',
              }
            },
            required: ['timezone']
          }
        },
        {
          name: 'format_date',
          description: 'Format a date string according to specified format',
          inputSchema: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'ISO date string or timestamp'
              },
              format: {
                type: 'string',
                description: 'Format string for the output'
              },
              timezone: {
                type: 'string',
                description: 'Optional timezone for conversion'
              }
            },
            required: ['date', 'format']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_current_time': {
          const { timezone, format = 'YYYY-MM-DD HH:mm:ss z' } = request.params.arguments as any;
          try {
            const date = new Date();
            const formattedDate = new Intl.DateTimeFormat('en-US', {
              timeZone: timezone,
              dateStyle: 'full',
              timeStyle: 'long'
            }).format(date);

            return {
              content: [
                {
                  type: 'text',
                  text: formattedDate
                }
              ]
            };
          } catch (error: any) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Invalid timezone: ${timezone} - ${error.message}`
            );
          }
        }

        case 'format_date': {
          const { date, format, timezone } = request.params.arguments as any;
          try {
            const inputDate = new Date(date);
            const options: Intl.DateTimeFormatOptions = {
              dateStyle: 'full',
              timeStyle: 'long'
            };
            if (timezone) {
              options.timeZone = timezone;
            }
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(inputDate);

            return {
              content: [
                {
                  type: 'text',
                  text: formattedDate
                }
              ]
            };
          } catch (error: any) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Invalid date or format: ${error.message}`
            );
          }
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
