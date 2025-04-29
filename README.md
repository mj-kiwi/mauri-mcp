# Mauri MCP Framework

A framework for building MCP (Model-Controller-Prompt) applications using functional programming and decorators.

## What's inside?

This monorepo includes the following packages:

### Packages

- `@mj-kiwi/mauri-mcp`: Core package for the MCP Framework
  - Decorator-based API for tools, prompts, and resources
  - Multiple transport layers (HTTP, SSE, STDIO)
  - Built-in authentication (API Key, JWT)
  - Type-safe with Zod schemas

### Features

- **Decorator-based API**: Define tools, prompts, and resources using decorators
- **Type Safety**: Built-in support for Zod schemas and TypeScript
- **Multiple Transports**: Support for HTTP, SSE, and STDIO transports
- **Authentication**: Built-in support for API Key and JWT authentication
- **Extensible**: Easy to add new transports and authentication methods

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/mj-kiwi/mauri.git
cd mauri

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Start development mode
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Project Structure

```
mauri/
├── packages/
│   └── core/                 # Core MCP Framework
│       ├── src/
│       │   ├── auths/       # Authentication implementations
│       │   ├── decorators/  # Decorator implementations
│       │   ├── transports/  # Transport layer implementations
│       │   ├── registry.ts  # Registry for decorated items
│       │   └── server.ts    # Main server implementation
│       └── package.json
└── package.json
```

## Documentation

For detailed documentation, please refer to the [core package README](./packages/core/README.md).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
