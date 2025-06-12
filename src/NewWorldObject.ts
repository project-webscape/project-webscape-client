import {
  Scene,
  Group,
} from "three";
import { Loc } from "./Loc";
import { Location } from "./types";

export class NewWorldObject {
  protected loc: Loc;
  protected model: Group;
  protected location: Location;

  public instance: Group;

  constructor(loc: Loc, type: number, rotation: number, model: Group) {
    this.loc = loc;
    const location = loc.getLocation();
    this.location = { ...location };

    this.model = model;
    this.instance = this.model;
  }

  render(scene: Scene) {
    this.model.scale.set(1 / 128, 1 / 128, 1 / 128);
    this.model.position.set(
      this.location.x,
      this.location.y + 0.2,
      this.location.z
    );
    scene.add(this.model);
  }

  getNormalizedLocation() {
    const x = this.location?.x ?? 0;
    const y = this.location?.y ?? 0;
    const z = this.location?.z ? 64 - 1 - this.location.z : 0;

    return {
      x,
      y,
      z,
      toString: () => {
        return `X: ${x}, Y: ${y}, Z: ${z}`;
      },
    };
  }

  getInstanceId() {
    return this.instance.id;
  }

  getObjectId() {
    return this.loc.getObjectId();
  }

  getModelId() {
    return -1;
  }

  getWallType() {
    return -1;
  }
}
