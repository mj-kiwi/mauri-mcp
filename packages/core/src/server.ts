import { MCPRegistry } from "./registry.js";
import { AuthConfig, AuthResult } from "./auths/types.js";
import { AuthFactory } from "./auths/factory.js";
import { PromptDefinition } from "./registry.js";
import {
  ResourceDefinition,
  ResourceContent,
  ResourceTemplate,
  ToolResult,
  SamplingRequest,
  SamplingResponse,
  Root,
  RootCapability,
  RootChange,
} from "./types.js";

export class MCPServer {
  private registry: MCPRegistry;
  private auth: ReturnType<typeof AuthFactory.create> | null = null;
  private roots: Root[] = [];
  private rootCapability: RootCapability = {
    supported: true,
    changeable: true,
  };

  constructor(authConfig?: AuthConfig) {
    this.registry = MCPRegistry.getInstance();
    if (authConfig) {
      this.auth = AuthFactory.create(authConfig);
    }
  }

  registerClass(instance: any) {
    const tools =
      Reflect.getMetadata("tools", instance.constructor.prototype) || {};
    const prompts =
      Reflect.getMetadata("prompts", instance.constructor.prototype) || {};
    const resources =
      Reflect.getMetadata("resources", instance.constructor.prototype) || {};

    // Register tools
    Object.entries(tools).forEach(([name, tool]: [string, any]) => {
      this.registry.registerTool({
        name: tool.name || name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
        handler: instance[tool.method].bind(instance),
      });
    });

    // Register prompts
    Object.entries(prompts).forEach(([name, prompt]: [string, any]) => {
      this.registry.registerPrompt({
        name: prompt.name || name,
        description: prompt.description,
        content: prompt.template,
        variables: prompt.variables,
      });
    });

    // Register resources
    Object.entries(resources).forEach(([name, resource]: [string, any]) => {
      const uri = resource.uri || `resource://${resource.name}`;
      this.registry.registerResource({
        uri: uri,
        name: resource.name || name,
        description: resource.description,
        mimeType: resource.type || resource.mimeType,
        content: {
          uri: uri,
          mimeType: resource.type || resource.mimeType,
          text:
            typeof resource.data === "object"
              ? JSON.stringify(resource.data)
              : resource.data,
        },
      });
    });
  }

  private async validateAuth(token?: string): Promise<AuthResult> {
    if (!this.auth) {
      return { isValid: true };
    }

    if (!token) {
      return {
        isValid: false,
        error: "Authentication token is required",
      };
    }

    return await this.auth.validate(token);
  }

  async executeTool(
    name: string,
    input: Record<string, any>,
    authToken?: string
  ): Promise<any> {
    const authResult = await this.validateAuth(authToken);
    if (!authResult.isValid) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Authentication failed: ${authResult.error}`,
          },
        ],
      };
    }

    const tool = this.registry.getTool(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    try {
      // Direct pass-through of the result from the tool handler
      return await tool.handler(input);
    } catch (error) {
      throw error;
    }
  }

  async getPrompt(
    name: string,
    args?: Record<string, string>,
    authToken?: string
  ): Promise<string> {
    const authResult = await this.validateAuth(authToken);
    if (!authResult.isValid) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    const prompt = this.registry.getPrompt(name);
    if (!prompt) {
      throw new Error(`Prompt '${name}' not found`);
    }

    // Validate required variables
    if (prompt.variables) {
      for (const variable of prompt.variables) {
        if (!args || !(variable in args)) {
          throw new Error(`Missing required variable: ${variable}`);
        }
      }
    }

    // Replace template variables with arguments
    let content = prompt.content;
    if (args) {
      for (const [key, value] of Object.entries(args)) {
        content = content.replace(new RegExp(`\\{${key}\\}`, "g"), value);
      }
    }

    return content;
  }

  async getResource(name: string, authToken?: string): Promise<any> {
    const authResult = await this.validateAuth(authToken);
    if (!authResult.isValid) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    // Find the resource by name instead of URI
    const resources = this.registry.listResources();
    const resource = resources.find((r) => r.name === name);

    if (!resource) {
      throw new Error(`Resource '${name}' not found`);
    }

    const content = this.registry.getResourceContent(resource.uri);
    if (!content) {
      throw new Error(`Content for resource '${name}' not found`);
    }

    // If the content was originally JSON, parse it back
    if (
      content.text &&
      (resource.mimeType === "json" || resource.mimeType === "application/json")
    ) {
      try {
        return JSON.parse(content.text);
      } catch (e) {
        return content.text;
      }
    }

    return content.text || content;
  }

  async listTools(authToken?: string) {
    const authResult = await this.validateAuth(authToken);
    if (!authResult.isValid) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    return this.registry.listTools();
  }

  async listPrompts(authToken?: string) {
    const authResult = await this.validateAuth(authToken);
    if (!authResult.isValid) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    return this.registry.listPrompts();
  }

  async listResources(authToken?: string): Promise<ResourceDefinition[]> {
    const authResult = await this.validateAuth(authToken);
    if (!authResult.isValid) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    return this.registry.listResources();
  }

  async createMessage(
    request: SamplingRequest,
    authToken?: string
  ): Promise<SamplingResponse> {
    const authResult = await this.validateAuth(authToken);
    if (!authResult.isValid) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }

    // Validate required fields
    if (!request.messages || request.messages.length === 0) {
      throw new Error("At least one message is required");
    }
    if (!request.maxTokens) {
      throw new Error("maxTokens is required");
    }

    // TODO: Implement actual LLM sampling
    // This is a placeholder implementation that returns a mock response
    return {
      model: "mock-model",
      role: "assistant",
      content: {
        type: "text",
        text: "This is a mock response. Actual LLM sampling is not implemented yet.",
      },
    };
  }

  clear() {
    this.registry.clear();
  }

  getRootCapability(): RootCapability {
    return this.rootCapability;
  }

  getRoots(): Root[] {
    return this.roots;
  }

  setRoots(roots: Root[]): void {
    this.roots = roots;
  }

  updateRoots(change: RootChange): void {
    if (!this.rootCapability.changeable) {
      throw new Error("Roots cannot be changed after connection");
    }

    if (change.added) {
      this.roots.push(...change.added);
    }

    if (change.removed) {
      this.roots = this.roots.filter(
        (root) => !change.removed?.includes(root.uri)
      );
    }
  }
}
