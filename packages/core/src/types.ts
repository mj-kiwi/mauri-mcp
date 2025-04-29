import { z } from "zod";

export interface ToolAnnotations {
  title?: string; // Human-readable title for the tool
  readOnlyHint?: boolean; // If true, the tool does not modify its environment
  destructiveHint?: boolean; // If true, the tool may perform destructive updates
  idempotentHint?: boolean; // If true, repeated calls with same args have no additional effect
  openWorldHint?: boolean; // If true, tool interacts with external entities
}

export interface ToolDefinition {
  name: string; // Unique identifier for the tool
  description?: string; // Human-readable description
  inputSchema: {
    // JSON Schema for the tool's parameters
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  annotations?: ToolAnnotations;
  handler: (input: Record<string, any>) => Promise<ToolResult>;
}

export interface ToolResult {
  isError?: boolean;
  content: Array<{
    type: "text" | "image" | "embeddedResource";
    text?: string;
    blob?: string; // base64 encoded for binary content
    uri?: string; // for embedded resources
  }>;
}

export interface ToolFunction {
  (input: Record<string, any>): Promise<ToolResult>;
}

export interface ToolConfig<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
> {
  name: string;
  description: string;
  input: TInput;
  output: TOutput;
}

export interface ToolMetadata<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
> {
  config: ToolConfig<TInput, TOutput>;
  fn: ToolFunction;
}

export interface PromptDefinition {
  name: string;
  template: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export interface ResourceDefinition {
  uri: string; // Unique identifier for the resource
  name: string; // Human-readable name
  description?: string; // Optional description
  mimeType?: string; // Optional MIME type
}

export interface ResourceTemplate {
  uriTemplate: string; // URI template following RFC 6570
  name: string; // Human-readable name for this type
  description?: string; // Optional description
  mimeType?: string; // Optional MIME type for all matching resources
}

export interface ResourceContent {
  uri: string; // The URI of the resource
  mimeType?: string; // Optional MIME type
  text?: string; // For text resources
  blob?: string; // For binary resources (base64 encoded)
}

export interface Message {
  role: "user" | "assistant";
  content: {
    type: "text" | "image";
    text?: string;
    data?: string; // base64 encoded
    mimeType?: string;
  };
}

export interface ModelPreferences {
  hints?: Array<{
    name?: string; // Suggested model name/family
  }>;
  costPriority?: number; // 0-1, importance of minimizing cost
  speedPriority?: number; // 0-1, importance of low latency
  intelligencePriority?: number; // 0-1, importance of capabilities
}

export interface SamplingRequest {
  messages: Message[];
  modelPreferences?: ModelPreferences;
  systemPrompt?: string;
  includeContext?: "none" | "thisServer" | "allServers";
  temperature?: number;
  maxTokens: number;
  stopSequences?: string[];
  metadata?: Record<string, unknown>;
}

export interface SamplingResponse {
  model: string; // Name of the model used
  stopReason?: "endTurn" | "stopSequence" | "maxTokens" | string;
  role: "user" | "assistant";
  content: {
    type: "text" | "image";
    text?: string;
    data?: string; // base64 encoded
    mimeType?: string;
  };
}

export interface Root {
  uri: string; // The URI of the root (e.g. file:///home/user/projects/myapp)
  name?: string; // Optional human-readable name for the root
}

export interface RootCapability {
  supported: boolean; // Whether the server supports roots
  changeable?: boolean; // Whether roots can be changed after connection
}

export interface RootChange {
  added?: Root[]; // Roots that were added
  removed?: string[]; // URIs of roots that were removed
}
