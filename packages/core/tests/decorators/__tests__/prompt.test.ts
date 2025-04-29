import { describe, it, expect, beforeEach } from "vitest";
import { Prompt } from "../../../src/decorators/prompt.js";
import "reflect-metadata";

describe("Prompt Decorator", () => {
  class TestClass {
    @Prompt({
      name: "testPrompt",
      description: "A test prompt",
      template: "Hello {name}!",
      arguments: [
        {
          name: "name",
          description: "The name to greet",
          required: true,
        },
      ],
    })
    testPrompt: string | undefined;
  }

  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });

  it("should register the prompt in metadata", () => {
    const metadata = Reflect.getMetadata("prompts", TestClass.prototype);
    expect(metadata).toBeDefined();
    expect(metadata.testPrompt).toBeDefined();
    expect(metadata.testPrompt.name).toBe("testPrompt");
    expect(metadata.testPrompt.description).toBe("A test prompt");
    expect(metadata.testPrompt.template).toBe("Hello {name}!");
    expect(metadata.testPrompt.arguments).toEqual([
      {
        name: "name",
        description: "The name to greet",
        required: true,
      },
    ]);
  });
});
