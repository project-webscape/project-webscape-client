import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { ModelHandler } from "./ModelHandler";
import { Group, Scene } from "three";
import { Location } from "./types";

export class WorldObject {
  protected modelId: number = -1;
  protected modelHandler: ModelHandler;
  protected model?: GLTF;
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

    this.modelId = modelId;

    this.wallType = wallType;

    if (modelId !== -1) {
      this.model = this.modelHandler.getModel(modelId);
      this.instance = this.model.scene.clone(true);
      this.instanceId = this.instance?.id;
    }
  }

  render(scene: Scene) {
    if (!this.model) {
      return this;
    }

    if (this.instance) {
      this.instance.scale.set(0.008, 0.008, 0.008);
      scene.add(this.instance);
      this.instance.position.y += 0.2;

      if (this.modelId === 596) {
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

  getInstanceId(): number | undefined {
    return this.instanceId;
  }
}
