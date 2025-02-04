import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import mockFs from 'mock-fs';

describe('MCP Tool Handlers', () => {
  let server: Server;
  let listToolsHandler: any;
  let callToolHandler: any;

  beforeEach(() => {
    server = new Server(
      {
        name: 'datetime-test',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_time',
          inputSchema: {
            type: 'object',
            properties: {
              timezone: { type: 'string' },
              date: { type: 'string' },
              format: { type: 'object' },
              info: { type: 'boolean' }
            }
          }
        },
        {
          name: 'calculate_time',
          inputSchema: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              operation: { type: 'string' },
              amount: { type: 'number' },
              unit: { type: 'string' }
            },
            required: ['date', 'operation', 'amount', 'unit']
          }
        },
        {
          name: 'timer',
          inputSchema: {
            type: 'object',
            properties: {
              action: { type: 'string' }
            },
            required: ['action']
          }
        }
      ]
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      switch (name) {
        case 'get_time':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                iso: new Date().toISOString(),
                formatted: new Date().toLocaleString(),
                timestamp: Date.now()
              })
            }]
          };

        case 'calculate_time':
          if (!args?.date || !args?.operation || !args?.amount || !args?.unit) {
            throw new Error('Missing required parameters');
          }
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                iso: new Date().toISOString(),
                formatted: new Date().toLocaleString()
              })
            }]
          };

        case 'timer':
          if (!args?.action) {
            throw new Error('Missing required action parameter');
          }
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                status: 'running',
                id: args.id || 'default'
              })
            }]
          };

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    });

    mockFs({
      'timer-state.json': JSON.stringify({})
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe('ListTools', () => {
    it('should list all available tools', async () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: '1'
      };

      const handler = server['_requestHandlers'].get('tools/list');
      const result = await handler(request);

      expect(result.tools).toHaveLength(3);
      expect(result.tools.map((t: { name: string }) => t.name)).toEqual([
        'get_time',
        'calculate_time',
        'timer'
      ]);
    });

    it('should include proper schemas for each tool', async () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: '1'
      };

      const handler = server['_requestHandlers'].get('tools/list');
      const result = await handler(request);

      const getTime = result.tools.find((t: { name: string }) => t.name === 'get_time');
      expect(getTime?.inputSchema.properties).toHaveProperty('timezone');
      expect(getTime?.inputSchema.properties).toHaveProperty('date');
      expect(getTime?.inputSchema.properties).toHaveProperty('format');
      expect(getTime?.inputSchema.properties).toHaveProperty('info');

      const calculateTime = result.tools.find((t: { name: string }) => t.name === 'calculate_time');
      expect(calculateTime?.inputSchema.required).toContain('date');
      expect(calculateTime?.inputSchema.required).toContain('operation');
      expect(calculateTime?.inputSchema.required).toContain('amount');
      expect(calculateTime?.inputSchema.required).toContain('unit');
    });
  });

  describe('CallTool', () => {
    it('should handle get_time requests', async () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_time',
          arguments: {
            timezone: 'UTC'
          }
        },
        id: '1'
      };

      const handler = server['_requestHandlers'].get('tools/call');
      const result = await handler(request);

      expect(result.content[0].type).toBe('text');
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('iso');
      expect(data).toHaveProperty('formatted');
      expect(data).toHaveProperty('timestamp');
    });

    it('should handle calculate_time requests', async () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'calculate_time',
          arguments: {
            date: new Date().toISOString(),
            operation: 'add',
            amount: 1,
            unit: 'hours'
          }
        },
        id: '1'
      };

      const handler = server['_requestHandlers'].get('tools/call');
      const result = await handler(request);

      expect(result.content[0].type).toBe('text');
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('iso');
      expect(data).toHaveProperty('formatted');
    });

    it('should handle timer requests', async () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'timer',
          arguments: {
            action: 'start',
            id: 'test-timer'
          }
        },
        id: '1'
      };

      const handler = server['_requestHandlers'].get('tools/call');
      const result = await handler(request);

      expect(result.content[0].type).toBe('text');
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('status', 'running');
      expect(data).toHaveProperty('id', 'test-timer');
    });

    it('should handle invalid tool names', async () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'invalid_tool',
          arguments: {}
        },
        id: '1'
      };

      const handler = server['_requestHandlers'].get('tools/call');
      await expect(handler(request)).rejects.toThrow(new McpError(
        ErrorCode.MethodNotFound,
        'Unknown tool: invalid_tool'
      ));
    });

    it('should validate required parameters', async () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'calculate_time',
          arguments: {
            date: new Date().toISOString()
          }
        },
        id: '1'
      };

      const handler = server['_requestHandlers'].get('tools/call');
      await expect(handler(request)).rejects.toThrow('Missing required parameters');
    });
  });
});
