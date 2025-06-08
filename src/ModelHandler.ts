import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const MODELS = [3328, 3114, 3115, 3116, 25177];

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
          console.log(gltf.animations);

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
