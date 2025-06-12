import { Group } from "three";
import { Cache } from "./Cache";
import { ModelHandler } from "./ModelHandler";
import { WorldObject } from "./WorldObject";
import { Loc } from "./Loc";
import { NewWorldObject } from "./NewWorldObject";
import { Model } from "./Model";

enum LocType {
  CENTREPIECE = 10,
  WALL_STRAIGHT = 0,
  WALL_CORNER_DIAGONAL = 1,
  WALL_L = 2,
  WALL_SQUARE_CORNER = 3,
  WALL_DIAGONAL = 9,
}

export class SceneBuilder {
  protected worldObjects: (WorldObject | NewWorldObject)[] = [];
  protected locs: Group[] = [];
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
      case LocType.WALL_L:
        const lo = new Loc(id, this.modelHandler, x, 0, z);

        const locDefModel = lo.getModel(type, rotation);
        if (!locDefModel) {
          return;
        }
        const { model } = locDefModel;

        const w1 = new NewWorldObject(lo, type, 4 + rotation, model);
        const w2 = new NewWorldObject(lo, type, (rotation + 1) & 0x3, model);
        this.worldObjects.push(w1);
        this.worldObjects.push(w2);
        break;
      case LocType.WALL_STRAIGHT:
      case LocType.WALL_CORNER_DIAGONAL:
      case LocType.WALL_SQUARE_CORNER:
      case LocType.WALL_DIAGONAL:
      default:
        const l1 = new Loc(id, this.modelHandler, x, 0, z);
        this.addRegularObject(l1, type, rotation);
        break;
    }

    return this;
  }

  getWorldObjects(): (WorldObject | NewWorldObject)[] {
    return this.worldObjects;
  }

  setWall(id: number, x: number, z: number, rotation: number, type: number) {
    const loc = Cache.getModelById(id, type);

    if (!loc) {
      console.warn(`Model with id ${id} and type ${type} not found.`);
      return;
    }

    const wo = new WorldObject(this.modelHandler, id, type);
    wo.setLocation({
      x: x,
      y: 0,
      z: z,
    });
    wo.setRotation(rotation);

    this.worldObjects.push(wo);
  }

  private addRegularObject(loc: Loc, type: number, rotation: number) {
    const locDefModel = loc.getModel(type, rotation);
    if (!locDefModel) {
      return;
    }

    const { model, isGltf } = locDefModel;

    if (!isGltf) {
      const wo = new NewWorldObject(loc, type, rotation, model);
      this.worldObjects.push(wo);
    } else {
      const wo = new WorldObject(this.modelHandler, loc.getObjectId(), type);
      wo.setLocation(loc.getLocation());
      wo.setRotation(rotation);
      this.worldObjects.push(wo);
    }
  }

  private addWallL(loc: Loc, type: number, rotation: number) {
    const locDefModel = loc.getModel(type, rotation);
    if (!locDefModel) {
      return;
    }
    const { model, isGltf } = locDefModel;
    if (!isGltf) {
      console.log("no gltf?");
    } else {
      const w1 = new NewWorldObject(loc, type, 4 + rotation, model);
      const w2 = new NewWorldObject(loc, type, (rotation + 1) & 0x3, model);
      this.worldObjects.push(w1);
      this.worldObjects.push(w2);
    }
  }
}
