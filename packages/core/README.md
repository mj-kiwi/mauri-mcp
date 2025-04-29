# Mauri MCP Framework

A framework for building MCP (Model-Controller-Prompt) applications using functional programming and decorators.

## Features

- **Decorator-based API**: Define tools, prompts, and resources using decorators
- **Type Safety**: Built-in support for Zod schemas and TypeScript
- **Multiple Transports**: Support for HTTP, SSE, and STDIO transports
- **Authentication**: Built-in support for API Key and JWT authentication
- **Extensible**: Easy to add new transports and authentication methods

## Installation

```bash
npm install @mj-kiwi/mauri-mcp
```

## Quick Start

### Define Tools

```typescript
import { Tool } from "@mj-kiwi/mauri-mcp";
import { z } from "zod";

class MyTools {
  @Tool({
    name: "getSiteMetrics",
    description: "Get metrics for a site",
    input: z.object({ siteId: z.number() }),
    output: z.object({ visitors: z.number(), pageviews: z.number() })
  })
  async getSiteMetrics(input: { siteId: number }) {
    // Implement your tool logic here
    return {
      visitors: 1000,
      pageviews: 5000
    };
  }
}
```

### Define Prompts

```typescript
import { Prompt } from "@mj-kiwi/mauri-mcp";

class MyPrompts {
  @Prompt({
    name: "welcome",
    description: "Welcome message",
    template: "Welcome to {name}!",
    variables: ["name"]
  })
  welcomePrompt: string;
}
```

### Define Resources

```typescript
import { Resource } from "@mj-kiwi/mauri-mcp";

class MyResources {
  @Resource({
    name: "config",
    description: "Application configuration",
    type: "json",
    data: { apiKey: "xxx" }
  })
  config: any;
}
```

### Create and Configure Server

```typescript
import { MCPServer } from "@mj-kiwi/mauri-mcp";

// Create server without authentication
const server = new MCPServer();

// Or with API Key authentication
const server = new MCPServer({
  type: "apiKey",
  apiKey: "your-api-key"
});

// Or with JWT authentication
const server = new MCPServer({
  type: "jwt",
  secret: "your-secret-key",
  issuer: "your-issuer",
  audience: "your-audience",
  expiresIn: "1h"
});
```

### Use HTTP Transport

```typescript
import { HTTPTransport } from "@mj-kiwi/mauri-mcp";

const httpTransport = new HTTPTransport(server);
httpTransport.listen(3000);
```

### Use SSE Transport

```typescript
import { SSETransport } from "@mj-kiwi/mauri-mcp";

const sseTransport = new SSETransport(server);
sseTransport.listen(3000);
```

### Use STDIO Transport

```typescript
import { STDIOTransport } from "@mj-kiwi/mauri-mcp";

const stdioTransport = new STDIOTransport(server);
stdioTransport.start();
```

## API Reference

### Decorators

#### `@Tool(config)`

Defines a tool with input and output schemas.

```typescript
@Tool({
  name: string,
  description: string,
  input: z.ZodType,
  output: z.ZodType
})
```

#### `@Prompt(config)`

Defines a prompt template with variables.

```typescript
@Prompt({
  name: string,
  description: string,
  template: string,
  variables: string[]
})
```

#### `@Resource(config)`

Defines a resource with type and data.

```typescript
@Resource({
  name: string,
  description: string,
  type: string,
  data: any
})
```

### Server Methods

#### `executeTool(name, input, authToken?)`

Executes a tool with the given input.

```typescript
const result = await server.executeTool("getSiteMetrics", { siteId: 1 }, "auth-token");
```

#### `getPrompt(name, authToken?)`

Gets a prompt template.

```typescript
const prompt = await server.getPrompt("welcome", "auth-token");
```

#### `getResource(name, authToken?)`

Gets a resource.

```typescript
const resource = await server.getResource("config", "auth-token");
```

#### `listTools(authToken?)`

Lists all registered tools.

```typescript
const tools = await server.listTools("auth-token");
```

#### `listPrompts(authToken?)`

Lists all registered prompts.

```typescript
const prompts = await server.listPrompts("auth-token");
```

#### `listResources(authToken?)`

Lists all registered resources.

```typescript
const resources = await server.listResources("auth-token");
```

## Authentication

### API Key Authentication

```typescript
const server = new MCPServer({
  type: "apiKey",
  apiKey: "your-api-key"
});
```

### JWT Authentication

```typescript
const server = new MCPServer({
  type: "jwt",
  secret: "your-secret-key",
  issuer: "your-issuer",
  audience: "your-audience",
  expiresIn: "1h"
});
```

## License

MIT 