import { describe, it, expect, beforeEach } from 'vitest';
import { Tool } from '../tool.js';
import 'reflect-metadata';

describe('Tool Decorator', () => {
  class TestClass {
    @Tool({
      name: 'testTool',
      description: 'A test tool',
      inputSchema: {
        type: 'object',
        properties: {
          value: { type: 'number' }
        },
        required: ['value']
      },
      annotations: {
        title: 'Test Tool',
        readOnlyHint: true,
        openWorldHint: false
      }
    })
    async testMethod(input: { value: number }) {
      return {
        content: [{
          type: 'text',
          text: `Result: ${input.value * 2}`
        }]
      };
    }
  }

  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });

  it('should register the tool in metadata', () => {
    const metadata = Reflect.getMetadata('tools', TestClass.prototype);
    expect(metadata).toBeDefined();
    expect(metadata.testTool).toBeDefined();
    expect(metadata.testTool.name).toBe('testTool');
    expect(metadata.testTool.description).toBe('A test tool');
    expect(metadata.testTool.inputSchema).toEqual({
      type: 'object',
      properties: {
        value: { type: 'number' }
      },
      required: ['value']
    });
    expect(metadata.testTool.annotations).toEqual({
      title: 'Test Tool',
      readOnlyHint: true,
      openWorldHint: false
    });
  });

  it('should execute the tool with valid input', async () => {
    const result = await instance.testMethod({ value: 5 });
    expect(result).toEqual({
      content: [{
        type: 'text',
        text: 'Result: 10'
      }]
    });
  });

  it('should handle invalid input', async () => {
    try {
      await instance.testMethod({ value: 'invalid' } as any);
      expect.fail('Should have thrown an error');
    } catch (error: unknown) {
      expect(error).toBeDefined();
      if (error instanceof Error) {
        expect(error.message).toContain('Input validation failed');
      } else {
        expect.fail('Error should be an instance of Error');
      }
    }
  });
}); 