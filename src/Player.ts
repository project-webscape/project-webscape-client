import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import {
  AnimationMixer,
  Scene,
  Group,
  AnimationClip,
} from "three";
import { Location } from "./types";
import { Animatable } from "./Animatable";
import { ModelHandler } from "./ModelHandler";

export class Player extends Animatable {
  protected model?: GLTF;
  protected location: Location = { x: 21, y: 0, z: 45 };
  protected playingAnimation: AnimationClip | null = null;
  protected modelHandler: ModelHandler = new ModelHandler();

  public instance?: Group; // store the actual rendered clone

  constructor(modelHandler: ModelHandler) {
    super();

    // Earth warrior champion
    this.model = modelHandler.getModel(3328);
    
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
  }

  faceTarget(target: Location): this {
    if (!this.instance) {
      console.warn("Instance is not set, cannot face target.");
      return this;
    }

    const dx = target.x - this.instance.position.x;
    const dz = target.z - this.instance.position.z;
    this.instance.rotation.y = Math.atan2(dx, dz);
    return this;
  }

  getLocation(): Location {
    return this.location;
  }

  setModel(model: GLTF): this {
    this.model = model;
    return this;
  }

  render(scene: Scene) {
    if (!this.model || !this.instance) {
      return false;
    }

    scene.add(this.instance);
    this.mixer = new AnimationMixer(this.instance);
  }

  die() {
    this.playAnimation(0);

    if (this.instance) {
      this.instance.rotation.x = -Math.PI / 2;
    }
  }

  update(delta: number) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
