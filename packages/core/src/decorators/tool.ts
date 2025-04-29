import "reflect-metadata";
import { z } from "zod";
import { ToolDefinition, ToolResult, ToolAnnotations } from "../types.js";

const TOOL_METADATA_KEY = Symbol("tool:metadata");

export interface ToolConfig {
  name?: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  annotations?: ToolAnnotations;
  input?: z.ZodType<any>; // Allow direct zod schema
  output?: z.ZodType<any>; // Allow direct zod schema
}

export function Tool(config: ToolConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const tools = Reflect.getMetadata("tools", target) || {};
    const name = config.name || propertyKey;

    tools[name] = {
      name,
      method: propertyKey,
      description: config.description,
      inputSchema: config.inputSchema,
      annotations: config.annotations,
    };

    // Wrap the original method to add input validation and result formatting
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        // Validate input against schema
        let validatedInput = args[0];

        // Handle input validation
        if (config.input) {
          // If a direct zod schema is provided, use it
          try {
            validatedInput = config.input.parse(validatedInput);
          } catch (validationError) {
            throw new Error(
              `Input validation failed: ${validationError instanceof Error ? validationError.message : "Invalid input"}`
            );
          }
        } else if (config.inputSchema) {
          // Otherwise use the inputSchema to create a zod schema
          try {
            // Create a Zod schema based on the input schema structure
            const schemaObj: Record<string, z.ZodTypeAny> = {};

            // Convert basic types
            for (const [key, prop] of Object.entries(
              config.inputSchema.properties
            )) {
              if (prop.type === "string") {
                schemaObj[key] = z.string();
              } else if (prop.type === "number") {
                schemaObj[key] = z.number();
              } else if (prop.type === "boolean") {
                schemaObj[key] = z.boolean();
              } else if (prop.type === "array") {
                schemaObj[key] = z.array(z.any());
              } else if (prop.type === "object") {
                schemaObj[key] = z.object({});
              } else {
                schemaObj[key] = z.any();
              }
            }

            // Build the schema
            let schema = z.object(schemaObj);

            // Add required fields
            if (
              config.inputSchema.required &&
              config.inputSchema.required.length > 0
            ) {
              const requiredFields = config.inputSchema.required.reduce(
                (acc, field) => {
                  acc[field] = true;
                  return acc;
                },
                {} as Record<string, true>
              );
              schema = schema.required(requiredFields);
            }

            validatedInput = schema.parse(validatedInput);
          } catch (validationError) {
            throw new Error(
              `Input validation failed: ${validationError instanceof Error ? validationError.message : "Invalid input"}`
            );
          }
        }

        // Execute the tool with validated input
        return await originalMethod.apply(this, [validatedInput]);
      } catch (error) {
        throw error; // Let the error propagate so it can be caught by the server
      }
    };

    Reflect.defineMetadata("tools", tools, target);
  };
}

export function getToolMetadata(
  target: any,
  propertyKey: string
): ToolDefinition | undefined {
  return Reflect.getMetadata(TOOL_METADATA_KEY, target, propertyKey);
}
