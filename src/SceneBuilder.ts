import { Cache } from "./Cache";
import { ModelHandler } from "./ModelHandler";
import { WorldObject } from "./WorldObject";

enum LocType {
  CENTREPIECE = 10,
  WALL_STRAIGHT = 0,
  WALL_CORNER_DIAGONAL = 1,
  WALL_L = 2,
  WALL_SQUARE_CORNER = 3,
  WALL_DIAGONAL = 9,
}

export class SceneBuilder {
  protected worldObjects: WorldObject[] = [];
  protected modelHandler: ModelHandler;

  constructor(modelHandler: ModelHandler) {
    this.modelHandler = modelHandler;
  }

  public addWorldObject(
    id: number,
    x: number,
    z: number,
    type: number,
    rotation: number
  ) {
    const info = (rotation << 6) + type;

    switch (type) {
      case LocType.WALL_STRAIGHT:
      case LocType.WALL_CORNER_DIAGONAL:
      case LocType.WALL_L:
      case LocType.WALL_SQUARE_CORNER:
      case LocType.WALL_DIAGONAL:
        this.setWall(id, x, z, rotation, type);
        break;
      default:
        const wo = new WorldObject(this.modelHandler, id);
        wo.setLocation({
          x: x,
          y: 0,
          z: z,
        });
        wo.setRotation(rotation);

        this.worldObjects.push(wo); 
        break;
    }

    return this;
  }

  getWorldObjects(): WorldObject[] {
    return this.worldObjects;
  }

  setWall(id: number, x: number, z: number, rotation: number, type: number) {
    const loc = Cache.getObjectById(id);

    if (!loc) {
      console.warn(`Object with id ${id} not found in cache.`);
      return;
    }

    let objectId = id;

    if(loc.objectTypes) {
        const indexOfIndex = loc.objectTypes.indexOf(type);
        if (indexOfIndex === -1) {
          console.warn(
            `LocType ${LocType.WALL_STRAIGHT} not found in objectTypes.`
          );
          return;
        }
    
        objectId = loc.objectModels[indexOfIndex];
    }


    if (!objectId) {
      console.warn(
        `Object ID for LocType ${LocType.WALL_STRAIGHT} not found. Rotation ${rotation}`
      );
      return;
    }

    const wo = new WorldObject(this.modelHandler, objectId, type);
    wo.setLocation({
      x: x,
      y: 0,
      z: z,
    });
    wo.setRotation(rotation);

    this.worldObjects.push(wo);
  }
}
