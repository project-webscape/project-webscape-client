import { Box3, Color, Vector3 } from "three";
import { Cache } from "./Cache";
import { ModelHandler } from "./ModelHandler";
import { Location } from "./types";

import * as THREE from "three";
import { Model } from "./Model";

function rsHslToRgb(hsl: number): Color {
  const h = ((hsl >> 10) & 0x3f) / 64; // hue: 0.0 - 1.0
  const s = ((hsl >> 7) & 0x07) / 8; // sat: 0.0 - 1.0
  const l = (hsl & 0x7f) / 128; // light: 0.0 - 1.0

  const color = new Color();
  color.setHSL(h, s, l);
  return color;
}

export class Loc {
  protected objectTypes: number[];
  protected objectModels: number[];
  protected modelHandler: ModelHandler;
  protected id: number;
  protected def: any;
  protected location: Location;

  constructor(
    id: number,
    modelHandler: ModelHandler,
    x: number,
    y: number,
    z: number
  ) {
    const loc = Cache.getObjectById(id);

    this.id = id;
    this.objectModels = loc.objectModels;
    this.objectTypes = loc.objectTypes || [];
    this.modelHandler = modelHandler;
    this.location = {
      x: x,
      y: y,
      z: z,
    };
  }

  public getModel(kind: number, rotation: number) {
    let modelId = null;

    if (!this.objectTypes || this.objectTypes?.length === 0) {
      modelId = this.objectModels[0];
    } else {
      const indexOfIndex = this.objectTypes.indexOf(kind);
      if (indexOfIndex === -1) {
        modelId = this.objectModels[0];
      } else {
        modelId = this.objectModels[indexOfIndex];
      }
    }

    if(!modelId) {
        console.warn(`No model ID found for kind ${kind} in location ${this.id}.`);
    }

    const modelDef = Cache.getModelDefinitionById(modelId);

    if (!modelDef) {
      const gltf = this.modelHandler.getModel(modelId)!;

      const scene = gltf.scene.clone(true);

      return {
        model: scene.clone(true),
        isGltf: true,
      };
    }

    return {
      model: new Model(modelDef).constructModel(rotation),
      isGltf: false,
    };
  }

  public getObjectId() {
    return this.id;
  }

  public getLocation(): Location {
    return this.location;
  }
}
