import { ModelHandler } from "../ModelHandler";
import { AnimationMixer, Clock, Group, Scene, LoopOnce } from "three";
import { Spell } from "./Spell";

type EarthWaveState = "casting" | "travel" | "impact";

export class EarthWave extends Spell {
  public instance?: Group;
  protected mixer: AnimationMixer | null = null;
  private currentScene?: Scene;
  private modelHandler: ModelHandler;
  private state: EarthWaveState = "casting";
  private speed = 2;
  private onHitCallback?: () => void;

  constructor(modelHandler: ModelHandler) {
    // TODO: Also supply an ID here
    super("Earth Wave");
    this.modelHandler = modelHandler;
  }

  // TODO: Move to Animatable
  private playAnimationAndListen(animIndex = 0, onFinish?: () => void) {
    if (!this.model || !this.instance) return;
    this.mixer = new AnimationMixer(this.instance);
    const animationClip = this.model.animations[animIndex];
    if (!animationClip) {
      console.warn(
        "No animation found at index",
        animIndex,
        "for model",
        this.model
      );
      if (onFinish) onFinish();
      return;
    }

    const action = this.mixer.clipAction(animationClip);

    // TODO: Handle multiple loop modes, also stopping animation
    action.clampWhenFinished = true;
    action.reset().play();

    console.log(
      `Playing animation ${animationClip.name} on model ${
        this.model!.scene.name
      }`
    );

    if (onFinish) {
      setTimeout(() => {
        onFinish();
      }, animationClip.duration * 1000);
    }
  }

  private switchModel(modelId: number, scene: Scene) {
    this.setModel(this.modelHandler.getModel(modelId));
    if (this.instance && this.currentScene) {
      this.currentScene.remove(this.instance);
    }

    this.instance = this.model!.scene.clone(true);
    this.instance.position.set(
      this.location!.x,
      this.location!.y,
      this.location!.z
    );

    console.log(
      `123Switching model to ${this.model!.scene.name} at location:`,
      this.location
    );
    this.registerAnimations(
      this.model!.animations.map((animation, i) => {
        return {
          id: i,
          animation,
        };
      })
    );

    // wehoo gotta figure out the scaling stuff
    this.instance.scale.set(0.001, 0.001, 0.001);

    scene.add(this.instance);
    this.currentScene = scene;
  }

  render(scene: Scene) {
    console.log(`Rendering EarthWave instance at location:`, this.location);
    this.state = "casting";
    this.switchModel(3114, scene);
    this.playAnimationAndListen(0);

    // Hardcoded transition after 0.5 seconds
    setTimeout(() => {
      this.state = "travel";
      this.switchModel(3115, scene);
      this.playAnimationAndListen(0);
      console.log(
        `EarthWave instance switched to travel state at location:`,
        this.location
      );
    }, 500);
  }

  onHit(cb: () => void) {
    this.onHitCallback = cb;
  }

  update(delta: number) {
    if (this.mixer) this.mixer.update(delta);

    if (
      this.state === "travel" &&
      this.instance &&
      this.location &&
      this.target
    ) {
      const dir = {
        x: this.target.x - this.location.x,
        y: this.target.y - this.location.y,
        z: this.target.z - this.location.z,
      };
      const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
      if (length > 0.01) {
        // Normalize direction
        dir.x /= length;
        dir.y /= length;
        dir.z /= length;

        // Move towards target
        this.location.x += dir.x * this.speed * delta;
        this.location.y += dir.y * this.speed * delta;
        this.location.z += dir.z * this.speed * delta;
        this.instance.position.set(
          this.location.x,
          this.location.y,
          this.location.z
        );
      } else {
        this.state = "impact";
        this.switchModel(3116, this.currentScene!);
        this.playAnimationAndListen(0);
        this.onHitCallback?.();
      }
    }
  }

  destroy() {
    if (this.instance && this.currentScene) {
      this.currentScene.remove(this.instance);
      this.instance = undefined;
      this.mixer = null;
      this.currentScene = undefined;
      console.log(`EarthWave instance destroyed.`);
    }
  }
}
