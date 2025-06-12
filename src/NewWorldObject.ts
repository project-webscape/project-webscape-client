import * as THREE from "three";
import {
  Scene,
  Group,
  Mesh,
  Box3,
  Vector3,
  MeshBasicMaterial,
  DoubleSide,
  NearestFilter,
  Material,
  TextureLoader,
  Vector2,
} from "three";
import { Loc } from "./Loc";
import { Location } from "./types";

import objectDef10820 from "./modeldef-10820.json";
import objectDef879 from "./modeldef-879.json";
import objectDef634 from "./modeldef-634.json";

import { Cache } from "./Cache";
import { Model } from "./Model";
import { WorldObject } from "./WorldObject";

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
