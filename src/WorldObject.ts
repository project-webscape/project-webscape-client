import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { ModelHandler } from "./ModelHandler";
import { Group, Scene } from "three";
import { Location } from "./types";
import { Cache } from "./Cache";

export class WorldObject {
  protected objectId: number = -1;
  protected modelId: number = -1;
  protected modelHandler: ModelHandler;
  protected model?: GLTF;
  protected actualModelId: number = -1;
  protected location?: Location;
  protected wallType?: number;
  protected instanceId?: number;

  public instance?: Group;

  constructor(
    modelHandler: ModelHandler,
    modelId: number = -1,
    wallType?: number
  ) {
    this.modelHandler = modelHandler;

    this.wallType = wallType;

    if (modelId !== -1) {
      const actualModel = Cache.getModelById(modelId, wallType);
      if (!actualModel) {
        console.warn(`Model with ID ${modelId} not found in cache.`);
        return;
      }

      const model = this.modelHandler.getModel(actualModel.model);

      if (!model) {
        console.warn(`Model with ID ${actualModel} not found in ModelHandler.`);
        return;
      }

      this.model = model;

      this.actualModelId = actualModel.model;
      this.modelId = this.actualModelId;
      this.objectId = modelId;

      this.instance = this.model.scene.clone(true);
      this.instanceId = this.instance?.id;
    }
  }

  render(scene: Scene) {
    if (!this.model) {
      return this;
    }

    if (this.instance) {
      this.instance.scale.set(1 / 128, 1 / 128, 1 / 128);

      scene.add(this.instance);
      this.instance.position.y += 0.2;

      if (this.modelId === 1276) {
        // sizeX = 2
        // table, TODO: fix bigger objects automatically
        this.instance.position.z -= 1.5;
      } else if (this.modelId === 114) {
      }
    }

    return this;
  }

  setLocation(location: Location): this {
    this.location = location;

    if (!this.instance) {
      return this;
    }

    if (this.model && this.model.scene) {
      this.instance?.position.set(location.x, location.y, location.z);
    }

    return this;
  }

  setRotation(rotation: number): this {
    if (!this.instance) {
      return this;
    }

    // 0 = north,
    // 1 = west,
    // 2 = south,
    // 3 = east

    switch (rotation) {
      case 0:
        this.instance.rotation.y = 0;
        break;
      case 1:
        this.instance.rotation.y = (3 * Math.PI) / 2;
        break;
      case 2:
        this.instance.rotation.y = Math.PI;
        break;
      case 3:
        this.instance.rotation.y = Math.PI / 2;
        break;
      default:
        console.warn(
          `Unknown rotation value: ${rotation}. Defaulting to North.`
        );
        this.instance.rotation.y = 0;
    }

    return this;
  }

  getModelId(): number {
    return this.modelId;
  }

  getObjectId(): number {
    return this.objectId;
  }

  getInstanceId(): number | undefined {
    return this.instanceId;
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
      }
    }
  }

  getWallType(): number | undefined {
    return this.wallType;
  }
}
