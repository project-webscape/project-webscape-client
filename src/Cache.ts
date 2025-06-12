interface Object {
  id: number;
  x: number;
  y: number;
  direction: number;
  type: number;
  mask: number;
  animatable: boolean;
}

import { objects } from "./generated/Objects";
import { cacheObjects } from "./generated/CacheObjects";
import { modelDefs } from "./generated/ModelDefsDefined";

export class Cache {
  static objects: Object[] = objects;
  static objectDefinitions: Map<number, (typeof cacheObjects)[0]> = new Map(
    cacheObjects.map((obj) => [obj.id, obj])
  );
  static modelDefinitions: Map<number, number[]> = new Map();

  static async initModelDefinitions() {
    for (const modelDef of modelDefs) {
      try {
        const response = await fetch(
          "/model-definitions/" + modelDef + ".json"
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch model definition for id ${modelDef}: ${response.statusText}`
          );
        }

        const data = await response.json();

        this.modelDefinitions.set(modelDef, data);
      } catch (e) {
        console.error(
          `Error initializing model definition for id ${modelDef}:`,
          e
        );
      }
    }

    console.log(
      `Initialized model definitions for ${this.modelDefinitions.size} models.`
    );
  }

  static getObjectById(id: number): (typeof cacheObjects)[0] {
    return Cache.objectDefinitions.get(id)!;
  }

  static getModelDefinitionById(id: number) {
    const modelDef = Cache.modelDefinitions.get(id);
    if (!modelDef) {
      return null;
    }
    return modelDef;
  }

  static getModelById(id: number, type?: number) {
    const object = Cache.getObjectById(id);
    if (!object) {
      console.warn(`Object with id ${id} not found in cache.`);
      return null;
    }

    if (type !== undefined && object.objectTypes) {
      const indexOfIndex = object.objectTypes.indexOf(type);
      if (indexOfIndex === -1) {
        return {
            model: object.objectModels[0],
            def: object,
        }
      }
      return {
        model: object.objectModels[indexOfIndex],
        def: object,
      };
    }

    return {
      model: object.objectModels[0],
      def: object,
    };
  }
}
