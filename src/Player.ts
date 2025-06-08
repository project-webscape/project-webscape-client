import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { AnimationMixer, Clock, Scene, Group, LoopRepeat, AnimationClip } from "three";
import { Location } from "./types";
import { LoopOnce } from "three";
import { Animatable } from "./Animatable";
import { ModelHandler } from "./ModelHandler";

export class Player extends Animatable{
  protected model?: GLTF;
  protected location: Location = { x: 0, y: 0, z: 0 };
  protected playingAnimation: AnimationClip | null = null;
  protected modelHandler: ModelHandler = new ModelHandler();

  protected mixer?: AnimationMixer;
  public instance?: Group; // store the actual rendered clone

  constructor(modelHandler: ModelHandler) {
    super();

    // Earth warrior champion
    this.model = modelHandler.getModel(3328);
  }

  getLocation(): Location {
    return this.location;
  }

  setModel(model: GLTF): this {
    this.model = model;
    return this;
  }

  render(scene: Scene) {
    if (!this.model) {
      return false;
    }

    // If already rendered, do not add again
    if (!this.instance) {
      this.instance = this.model.scene.clone(true);
      this.instance.scale.set(0.005, 0.005, 0.005);
      this.instance.position.set(
        this.location.x,
        this.location.y,
        this.location.z
      );

      scene.add(this.instance);

      this.mixer = new AnimationMixer(this.instance);
    }
  }

  die() {
    this.playAnimation(0);

    if (this.instance) {
      this.instance.rotation.x = -Math.PI / 2;
    }
  }

  // TODO: Move EarthWaves playAnimation to Animatable, implement there.
  playAnimation(animationId: number, onFinish?: () => void) {
    if (!this.model || !this.mixer) {
      return;
    }

    const clip = this.model.animations[animationId];
    if (!clip) return;

    if( this.playingAnimation ) {
      const action = this.mixer.clipAction(this.playingAnimation);
      action.stop();
    }

    this.playingAnimation = clip;

    const action = this.mixer.clipAction(clip);
    action.reset();
    action.clampWhenFinished = true;
    action.play();
  }

  update(delta: number) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
