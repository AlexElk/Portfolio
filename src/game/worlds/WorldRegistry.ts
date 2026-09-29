import type { WorldBuildContext, WorldBuildResult, WorldDefinition, WorldId, WorldOptions } from './types';

export class WorldRegistry {
  private readonly definitions = new Map<WorldId, WorldDefinition>();

  constructor(definitions: WorldDefinition[] = []) {
    definitions.forEach((definition) => this.register(definition));
  }

  public register(definition: WorldDefinition): this {
    if (this.definitions.has(definition.id)) {
      throw new Error(`World "${definition.id}" is already registered.`);
    }

    this.definitions.set(definition.id, definition);
    return this;
  }

  public build(
    id: WorldId,
    context: WorldBuildContext,
    options?: WorldOptions
  ): WorldBuildResult {
    const definition = this.definitions.get(id);
    if (!definition) {
      throw new Error(`World "${id}" is not registered.`);
    }

    return definition.build(context, options);
  }
}