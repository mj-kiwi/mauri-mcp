import { MCPServer } from "../server.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";

export class HTTPTransport {
  private server: MCPServer;
  private httpServer: ReturnType<typeof createServer>;

  constructor(server: MCPServer) {
    this.server = server;
    this.httpServer = createServer(this.handleRequest.bind(this));
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const { pathname, query } = parse(req.url || "", true);
    const method = req.method?.toUpperCase();

    try {
      if (method === "GET") {
        if (pathname === "/tools") {
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
      this.sendResponse(res, 500, {
        error: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
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

  listen(port: number, hostname?: string) {
    return new Promise<void>((resolve) => {
      this.httpServer.listen(port, hostname, () => {
        console.log(
          `HTTP server listening on ${hostname || "localhost"}:${port}`
        );
        resolve();
      });
    });
  }

  close() {
    return new Promise<void>((resolve) => {
      this.httpServer.close(() => {
        console.log("HTTP server closed");
        resolve();
      });
    });
  }
}
