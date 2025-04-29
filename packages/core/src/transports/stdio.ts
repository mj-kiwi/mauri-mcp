import { MCPServer } from "../server.js";
import { z } from "zod";
import { createInterface } from "readline";

interface STDIORequest {
  type: "execute" | "list";
  payload: {
    toolName?: string;
    input?: any;
    listType?: "tools" | "prompts" | "resources";
  };
}

export class STDIOTransport {
  private server: MCPServer;
  private rl: ReturnType<typeof createInterface>;

  constructor(server: MCPServer) {
    this.server = server;
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  start() {
    console.log("STDIO transport started. Type 'help' for available commands.");
    this.rl.on("line", async (line) => {
      try {
        await this.handleInput(line);
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : "Unknown error");
      }
      this.rl.prompt();
    });

    this.rl.setPrompt("> ");
    this.rl.prompt();
  }

  private async handleInput(line: string) {
    const trimmed = line.trim();
    if (trimmed === "help") {
      this.showHelp();
      return;
    }

    try {
      const request = JSON.parse(trimmed) as STDIORequest;
      await this.handleRequest(request);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error("Invalid JSON input");
      } else {
        throw error;
      }
    }
  }

  private async handleRequest(request: STDIORequest) {
    switch (request.type) {
      case "execute":
        if (!request.payload.toolName || !request.payload.input) {
          throw new Error("Missing toolName or input in execute request");
        }
        const result = await this.server.executeTool(
          request.payload.toolName,
          request.payload.input
        );
        console.log("Result:", JSON.stringify(result, null, 2));
        break;

      case "list":
        if (!request.payload.listType) {
          throw new Error("Missing listType in list request");
        }
        let items;
        switch (request.payload.listType) {
          case "tools":
            items = this.server.listTools();
            break;
          case "prompts":
            items = this.server.listPrompts();
            break;
          case "resources":
            items = this.server.listResources();
            break;
          default:
            throw new Error(`Invalid list type: ${request.payload.listType}`);
        }
        console.log("Items:", JSON.stringify(items, null, 2));
        break;

      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  private showHelp() {
    console.log(`
Available commands:
1. Execute a tool:
   {"type":"execute","payload":{"toolName":"toolName","input":{...}}}

2. List items:
   {"type":"list","payload":{"listType":"tools|prompts|resources"}}

3. Help:
   help
    `);
  }

  close() {
    this.rl.close();
    console.log("STDIO transport closed");
  }
} 