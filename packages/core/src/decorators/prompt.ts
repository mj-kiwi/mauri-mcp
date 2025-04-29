import "reflect-metadata";

const PROMPT_METADATA_KEY = Symbol("prompt:metadata");

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptConfig {
  name?: string;
  description: string;
  template: string;
  arguments?: PromptArgument[];
}

export interface PromptMetadata {
  config: PromptConfig;
}

export function Prompt(config: PromptConfig) {
  return function (target: any, propertyKey: string) {
    const prompts = Reflect.getMetadata("prompts", target) || {};
    const name = config.name || propertyKey;

    prompts[name] = {
      name,
      description: config.description,
      template: config.template,
      arguments: config.arguments || []
    };

    Reflect.defineMetadata("prompts", prompts, target);
  };
}

export function getPromptMetadata(
  target: any,
  propertyKey: string
): PromptMetadata | undefined {
  return Reflect.getMetadata(PROMPT_METADATA_KEY, target, propertyKey);
}
