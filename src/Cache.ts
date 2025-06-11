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

export class Cache {
    static objects: Object[] = objects;
    static objectDefinitions: Map<number, typeof cacheObjects[0]> = new Map(cacheObjects.map(obj => [obj.id, obj]));

    static getObjectById(id: number): typeof cacheObjects[0] {
        return Cache.objectDefinitions.get(id)!;
    }

}
