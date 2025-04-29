import { MCPServer } from "../server.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import { z } from "zod";

export class SSETransport {
  private server: MCPServer;
  private httpServer: ReturnType<typeof createServer>;
  private clients: Set<ServerResponse> = new Set();

  constructor(server: MCPServer) {
    this.server = server;
    this.httpServer = createServer(this.handleRequest.bind(this));
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const { pathname, query } = parse(req.url || "", true);
    const method = req.method?.toUpperCase();

    try {
      if (method === "GET") {
        if (pathname === "/events") {
          this.handleSSEConnection(req, res);
          return;
        } else if (pathname === "/tools") {
          const tools = this.server.listTools();
          this.sendResponse(res, 200, tools);
          return;
        } else if (pathname === "/prompts") {
          const prompts = this.server.listPrompts();
          this.sendResponse(res, 200, prompts);
          return;
        } else if (pathname === "/resources") {
          const resources = this.server.listResources();
          this.sendResponse(res, 200, resources);
          return;
        }
      } else if (method === "POST") {
        if (pathname?.startsWith("/tools/")) {
          const toolName = pathname.split("/")[2];
          const body = await this.readBody(req);
          const result = await this.server.executeTool(toolName, body);
          this.sendResponse(res, 200, result);
          return;
        }
      }

      this.sendResponse(res, 404, { error: "Not Found" });
    } catch (error) {
      this.sendResponse(res, 500, { error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }

  private handleSSEConnection(req: IncomingMessage, res: ServerResponse) {
    // Set headers for SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    // Add client to the set
    this.clients.add(res);

    // Remove client when connection is closed
    req.on("close", () => {
      this.clients.delete(res);
    });

    // Send initial connection message
    this.sendSSEMessage(res, "connected", { message: "Connected to SSE server" });
  }

  private sendSSEMessage(res: ServerResponse, event: string, data: any) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  private async readBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error("Invalid JSON body"));
        }
      });
      req.on("error", reject);
    });
  }

  private sendResponse(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }

  // Broadcast a message to all connected clients
  broadcast(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => {
      if (!client.writableEnded) {
        client.write(message);
      }
    });
  }

  listen(port: number, hostname?: string) {
    return new Promise<void>((resolve) => {
      this.httpServer.listen(port, hostname, () => {
        console.log(`SSE server listening on ${hostname || "localhost"}:${port}`);
        resolve();
      });
    });
  }

  close() {
    return new Promise<void>((resolve) => {
      // Close all client connections
      this.clients.forEach((client) => {
        client.end();
      });
      this.clients.clear();

      // Close the server
      this.httpServer.close(() => {
        console.log("SSE server closed");
        resolve();
      });
    });
  }
} 