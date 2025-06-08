import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { ModelHandler } from "./ModelHandler";
import { Group, Scene } from "three";
import { Location } from "./types";

export class WorldObject {
  protected modelId: number = -1;
  protected modelHandler: ModelHandler;
  protected model?: GLTF;
  protected location?: Location;

  public instance?: Group;

  constructor(modelHandler: ModelHandler, modelId: number = -1) {
    this.modelHandler = modelHandler;

    this.modelId = modelId;

    if (modelId !== -1) {
      this.model = this.modelHandler.getModel(modelId);
      this.instance = this.model.scene.clone(true);
    }
  }

  
  render(scene: Scene) {
    if (!this.model) {
      return this;
    }


    if(this.instance) {
        this.instance.scale.set(0.005, 0.005, 0.005);
        scene.add(this.instance);
    }

    return this;
  }

  setLocation(location: Location): this {
    this.location = location;

    if(!this.instance) {
        return this;
    }

    if (this.model && this.model.scene) {
      this.instance?.position.set(
        location.x,
        location.y,
        location.z
      );

      // For now hardcoded, spawns the dummy facing the player
      this.instance.rotation.y = Math.PI;
    }

    return this;
  }
}
