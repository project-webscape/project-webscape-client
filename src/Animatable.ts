import { AnimationClip, AnimationMixer, Group } from "three";

interface AnimationInput {
  id: number;
  animation: AnimationClip;
}

export class Animatable {
  protected animations: Map<number, AnimationClip> = new Map();
  protected mixer: AnimationMixer | null = null;
  protected playingAnimation: AnimationClip | null = null;

  protected setMixer(instance: Group): this {
    this.mixer = new AnimationMixer(instance);
    return this;
  }

  protected registerAnimations(
    animations: AnimationInput[],
    override?: boolean
  ): this {
    if (override) {
      this.animations.clear();
    }

    for (const animation of animations) {
      this.registerAnimation(animation);
    }

    return this;
  }

  protected registerAnimation(animation: AnimationInput): this {
    this.animations.set(animation.id, animation.animation);

    return this;
  }

  public playAnimation(id: number, callback?: () => void): void {
    if (!this.mixer) {
      console.warn("Animation mixer is not set.");
      return;
    }

    const animation = this.animations.get(id);

    if (!animation) {
      console.warn(`Animation with id ${id} not found.`);
      return;
    }

    if (this.playingAnimation) {
      const action = this.mixer.clipAction(this.playingAnimation);
      action.stop();
    }

    this.playingAnimation = animation;

    const action = this.mixer.clipAction(animation);
    action.reset();
    action.clampWhenFinished = true;
    action.play();

    if (callback) {
      setTimeout(() => {
        callback();
      }, animation.duration * 1000);
    }
  }
}
