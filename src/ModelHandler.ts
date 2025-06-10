import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { objects } from "./generated/Objects";
import { npcs } from "./generated/Npcs";

const walls = [
  678, 679, 636, 637, 638, 634, 635, 574, 575, 576, 1009, 1010, 1011, 1012,
  1013, 993, 995, 996, 998, 999, 862, 844, 845, 846, 847, 848, 849, 850, 851,
  852, 853, 646, 647, 648, 649, 650, 960, 961, 962, 963, 964, 7373, 7374, 7375,
  7376, 7377, 3531, 3532, 3533, 3534,
];
const defaultModels = [...walls, 3328, 3114, 3115, 3116, 25177];

const modelIds = new Set(objects.map((object) => object.id));
const npcIds = new Set(npcs.map((npc) => npc.id));

const MODELS = Array.from(modelIds)
  .concat(defaultModels)
  .concat(Array.from(npcIds))
  .sort((a, b) => a - b);

interface Model {
  id: number;
  gltf: GLTF;
}

export class ModelHandler {
  protected models: Model[] = [];
  protected loader: GLTFLoader = new GLTFLoader();

  constructor() {}

  protected async asyncLoadModel(modelName: number): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        `models/${modelName}.gltf`,
        (gltf) => {
          gltf.scene.traverse((child) => {
            if ((child as any).isMesh && (child as any).material) {
              (child as any).material.needsUpdate = true;
            }
          });
          resolve(gltf);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  public async loadModels() {
    return await Promise.all(
      MODELS.map(async (modelName) => {
        try {
          const gltf = await this.asyncLoadModel(modelName);
          this.models.push({ id: modelName, gltf });
        } catch (error) {
          console.error(`Failed to load model ${modelName}:`, error);
        }
      })
    );
  }

  getModel(modelKey: number): GLTF {
    const correctModel = this.models.find((model) => model.id === modelKey);

    if (!correctModel) {
      throw new Error(`Model with key "${modelKey}" not found.`);
    }

    return correctModel.gltf;
  }
}
