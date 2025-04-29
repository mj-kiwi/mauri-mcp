import { describe, it, expect, beforeEach } from "vitest";
import { Resource } from "../../../src/decorators/resource.js";
import "reflect-metadata";

describe("Resource Decorator", () => {
  class TestClass {
    @Resource({
      name: "testResource",
      description: "A test resource",
      mimeType: "application/json",
      content: {
        uri: "resource://testResource",
        mimeType: "application/json",
        text: JSON.stringify({ key: "value" }),
      },
    })
    testResource: any;
  }

  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });

  it("should register the resource in metadata", () => {
    const metadata = Reflect.getMetadata("resources", TestClass.prototype);
    expect(metadata).toBeDefined();
    expect(metadata.testResource).toBeDefined();
    expect(metadata.testResource.name).toBe("testResource");
    expect(metadata.testResource.description).toBe("A test resource");
    expect(metadata.testResource.mimeType).toBe("application/json");
    expect(metadata.testResource.uri).toBe("resource://testResource");
    expect(metadata.testResource.content).toEqual({
      uri: "resource://testResource",
      mimeType: "application/json",
      text: JSON.stringify({ key: "value" }),
    });
  });
});
