import { z } from "zod";
import { ResourceDefinition, ResourceTemplate, ResourceContent, ToolDefinition, ToolResult } from "./types.js";

export interface PromptDefinition {
  name: string;
  description: string;
  content: string;
  variables: string[];
}

export class MCPRegistry {
  private static instance: MCPRegistry;
  private tools: Map<string, ToolDefinition> = new Map();
  private prompts: Map<string, PromptDefinition> = new Map();
  private resources: Map<string, ResourceDefinition> = new Map();
  private resourceTemplates: Map<string, ResourceTemplate> = new Map();
  private resourceContents: Map<string, ResourceContent> = new Map();

  private constructor() {}

  static getInstance(): MCPRegistry {
    if (!MCPRegistry.instance) {
      MCPRegistry.instance = new MCPRegistry();
    }
    return MCPRegistry.instance;
  }

  // Tool registration
  registerTool(definition: ToolDefinition): void {
    if (this.tools.has(definition.name)) {
      throw new Error(`Tool with name '${definition.name}' already registered`);
    }
    this.tools.set(definition.name, definition);
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  // Prompt registration
  registerPrompt(definition: PromptDefinition): void {
    if (this.prompts.has(definition.name)) {
      throw new Error(`Prompt with name '${definition.name}' already registered`);
    }
    this.prompts.set(definition.name, definition);
  }

  getPrompt(name: string): PromptDefinition | undefined {
    return this.prompts.get(name);
  }

  listPrompts(): PromptDefinition[] {
    return Array.from(this.prompts.values());
  }

  // Resource registration
  registerResource(definition: ResourceDefinition & { content: ResourceContent }): void {
    if (this.resources.has(definition.uri)) {
      throw new Error(`Resource with URI '${definition.uri}' already registered`);
    }
    const { content, ...resourceDef } = definition;
    this.resources.set(definition.uri, resourceDef);
    this.resourceContents.set(definition.uri, content);
  }

  registerResourceTemplate(template: ResourceTemplate): void {
    if (this.resourceTemplates.has(template.uriTemplate)) {
      throw new Error(`Resource template '${template.uriTemplate}' already registered`);
    }
    this.resourceTemplates.set(template.uriTemplate, template);
  }

  getResource(uri: string): ResourceDefinition | undefined {
    return this.resources.get(uri);
  }

  getResourceContent(uri: string): ResourceContent | undefined {
    return this.resourceContents.get(uri);
  }

  listResources(): ResourceDefinition[] {
    return Array.from(this.resources.values());
  }

  listResourceTemplates(): ResourceTemplate[] {
    return Array.from(this.resourceTemplates.values());
  }

  // Clear all registrations
  clear(): void {
    this.tools.clear();
    this.prompts.clear();
    this.resources.clear();
    this.resourceTemplates.clear();
    this.resourceContents.clear();
  }
} 