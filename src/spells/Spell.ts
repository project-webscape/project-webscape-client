import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Animatable } from "../Animatable";
import { Location } from "../types";

export class Spell extends Animatable {
  protected spellName: string;
  protected modelId: number = -1;
  protected location: Location | undefined;
  protected model: GLTF | undefined;
  protected target?: Location; // Add this line

  constructor(spellName: string) {
    super();
    
    this.spellName = spellName;
  }

  public spawn(location: Location): this {
    this.location = { ...location };

    return this;
  }

  public setTarget(location: Location): this {
    this.target = { ...location };

    return this;
  }

  setModel(model: GLTF): this {
    this.model = model;
    return this;
  }
}
