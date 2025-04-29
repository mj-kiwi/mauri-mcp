import "reflect-metadata";
import { ResourceDefinition, ResourceContent } from "../types.js";

const RESOURCE_METADATA_KEY = Symbol("resource:metadata");

export interface ResourceConfig extends Omit<ResourceDefinition, 'uri'> {
  uri?: string;  // Optional in config, will be generated if not provided
  content: ResourceContent;
}

export interface ResourceMetadata {
  config: ResourceConfig;
}

export function Resource(config: ResourceConfig): PropertyDecorator {
  return (target, propertyKey) => {
    const resources = Reflect.getMetadata("resources", target) || {};
    const uri = config.uri || `resource://${config.name}`;

    resources[config.name] = {
      ...config,
      uri,
      property: propertyKey,
    };
    
    Reflect.defineMetadata("resources", resources, target);

    Object.defineProperty(target, propertyKey, {
      get() {
        return config.content;
      },
      enumerable: true,
      configurable: true,
    });
  };
}

export function getResourceMetadata(
  target: any,
  propertyKey: string
): ResourceMetadata | undefined {
  return Reflect.getMetadata(RESOURCE_METADATA_KEY, target, propertyKey);
}
