import { describe, it, expect, beforeEach } from "vitest";
import { MCPServer } from "../../src/server.js";
import { Tool, Prompt, Resource } from "../../src/decorators/index.js";
import { z } from "zod";
import "reflect-metadata";

describe("MCPServer", () => {
  class TestTools {
    @Tool({
      name: "testTool",
      description: "A test tool",
      input: z.object({ value: z.number() }),
      output: z.object({ result: z.number() }),
    })
    async testMethod(input: { value: number }) {
      return { result: input.value * 2 };
    }
  }

  class TestPrompts {
    @Prompt({
      name: "testPrompt",
      description: "A test prompt",
      template: "Hello {name}!",
      variables: ["name"],
    })
    testPrompt!: string;
  }

  class TestResources {
    @Resource({
      name: "testResource",
      description: "A test resource",
      type: "json",
      data: { key: "value" },
    })
    testResource!: any;
  }

  let server: MCPServer;
  let tools: TestTools;
  let prompts: TestPrompts;
  let resources: TestResources;

  beforeEach(() => {
    server = new MCPServer();
    tools = new TestTools();
    prompts = new TestPrompts();
    resources = new TestResources();

    server.clear();
    server.registerClass(tools);
    server.registerClass(prompts);
    server.registerClass(resources);
  });

  describe("Tool Execution", () => {
    it("should execute a tool with valid input", async () => {
      const result = await server.executeTool("testTool", { value: 5 });
      expect(result).toEqual({ result: 10 });
    });

    it("should throw error for invalid tool input", async () => {
      await expect(
        server.executeTool("testTool", { value: "invalid" })
      ).rejects.toThrow();
    });

    it("should throw error for non-existent tool", async () => {
      await expect(server.executeTool("nonExistentTool", {})).rejects.toThrow();
    });
  });

  describe("Prompt Management", () => {
    it("should get a prompt template", async () => {
      const prompt = await server.getPrompt("testPrompt");
      expect(prompt).toBe("Hello {name}!");
    });

    it("should throw error for non-existent prompt", async () => {
      await expect(server.getPrompt("nonExistentPrompt")).rejects.toThrow();
    });
  });

  describe("Resource Management", () => {
    it("should get a resource", async () => {
      const resource = await server.getResource("testResource");
      expect(resource).toEqual({ key: "value" });
    });

    it("should throw error for non-existent resource", async () => {
      await expect(server.getResource("nonExistentResource")).rejects.toThrow();
    });
  });

  describe("Listing", () => {
    it("should list all tools", async () => {
      const tools = await server.listTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe("testTool");
    });

    it("should list all prompts", async () => {
      const prompts = await server.listPrompts();
      expect(prompts).toHaveLength(1);
      expect(prompts[0].name).toBe("testPrompt");
    });

    it("should list all resources", async () => {
      const resources = await server.listResources();
      expect(resources).toHaveLength(1);
      expect(resources[0].name).toBe("testResource");
    });
  });

  describe("Roots Management", () => {
    it("should support roots by default", () => {
      const capability = server.getRootCapability();
      expect(capability.supported).toBe(true);
      expect(capability.changeable).toBe(true);
    });

    it("should initially have no roots", () => {
      const roots = server.getRoots();
      expect(roots).toHaveLength(0);
    });

    it("should set roots", () => {
      const newRoots = [
        { uri: "file:///home/user/projects/myapp", name: "My App" },
        { uri: "https://api.example.com/v1" },
      ];
      server.setRoots(newRoots);
      const roots = server.getRoots();
      expect(roots).toEqual(newRoots);
    });

    it("should update roots by adding new ones", () => {
      const initialRoots = [{ uri: "file:///home/user/projects/myapp" }];
      server.setRoots(initialRoots);

      const change = {
        added: [{ uri: "https://api.example.com/v1", name: "API" }],
      };
      server.updateRoots(change);

      const roots = server.getRoots();
      expect(roots).toHaveLength(2);
      expect(roots[1]).toEqual(change.added[0]);
    });

    it("should update roots by removing existing ones", () => {
      const initialRoots = [
        { uri: "file:///home/user/projects/myapp" },
        { uri: "https://api.example.com/v1" },
      ];
      server.setRoots(initialRoots);

      const change = {
        removed: ["file:///home/user/projects/myapp"],
      };
      server.updateRoots(change);

      const roots = server.getRoots();
      expect(roots).toHaveLength(1);
      expect(roots[0].uri).toBe("https://api.example.com/v1");
    });

    it("should handle both adding and removing roots in one update", () => {
      const initialRoots = [{ uri: "file:///home/user/projects/myapp" }];
      server.setRoots(initialRoots);

      const change = {
        added: [{ uri: "https://api.example.com/v1", name: "API" }],
        removed: ["file:///home/user/projects/myapp"],
      };
      server.updateRoots(change);

      const roots = server.getRoots();
      expect(roots).toHaveLength(1);
      expect(roots[0]).toEqual(change.added[0]);
    });
  });
});
