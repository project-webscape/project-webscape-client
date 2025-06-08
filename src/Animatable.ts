import { AnimationClip } from "three";

export class Animatable {
  protected animations: Map<number, () => void> = new Map();

  protected registerAnimations(animations: AnimationClip[]): this {
    
    return this;
  }

  protected registerAnimation(id: number, callback: () => void): this {
    this.animations.set(id, callback);

    return this;
  }

  protected playAnimation(id: number): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation();
    } else {
      console.warn(`Animation with id ${id} not found.`);
    }
  }
}
