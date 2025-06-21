import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { objects } from "./generated/Objects";
import { npcs } from "./generated/Npcs";
import { cacheObjects } from "./generated/CacheObjects";

const defaultModels = [3328, 3114, 3115, 3116, 25177];
const extraModels = [851];

let MODELS: any = [];

for(const cacheObject of cacheObjects) {
  for(const model of cacheObject.objectModels) {
    if (model !== -1 && !MODELS.includes(model)) {
      MODELS.push(model);
    }
  }
}

MODELS.push(
  ...defaultModels,
)

MODELS.push(
  ...extraModels,
)

MODELS = [3328];

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

  getModel(modelKey: number): GLTF | undefined {
    const correctModel = this.models.find((model) => model.id === modelKey);

    if (!correctModel) {
      console.warn(
        `Model with ID ${modelKey} not found. Attempting to load default model.`
      );

      return;
    }

    return correctModel.gltf;
  }
}
