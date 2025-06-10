import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Animatable } from "./Animatable";
import { AnimationMixer, Group, Scene } from "three";
import { ModelHandler } from "./ModelHandler";
import { Location } from "./types";

export class NPC extends Animatable {
  protected model?: GLTF;
  protected location?: Location;

  public instance?: Group;

  constructor(modelHandler: ModelHandler, id: number, location: Location) {
    super();

    this.location = location;
    this.model = modelHandler.getModel(id);

    this.instance = this.model.scene.clone(true);
    this.instance.scale.set(0.008, 0.008, 0.008);
    this.instance.position.set(
      this.location.x,
      this.location.y,
      this.location.z
    );

    super.registerAnimations(
      this.model.animations.map((animation, i) => {
        return {
          id: i,
          animation,
        };
      })
    );

    super.setMixer(this.instance);
    super.playAnimation(0);
  }

  render(scene: Scene) {
    if (!this.model || !this.instance) {
      throw new Error("Model or instance is not set.");
    }

    scene.add(this.instance);
    this.mixer = new AnimationMixer(this.instance);

    return this;
  }

  update(delta: number) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
