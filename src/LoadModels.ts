import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


// TODO: Non hardcoded list
const MODELS = [3328, 3114, 3115, 3116, 25177];

async function asyncLoadModel(modelName: string): Promise<GLTF> {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
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

export async function loadModels() {
  const loadedModels: Map<number, GLTF> = new Map();

  for (const modelName of MODELS) {
    try {
      const gltf = await asyncLoadModel(String(modelName));
      loadedModels.set(modelName, gltf);
    } catch (error) {
      console.error(`Failed to load model ${modelName}:`, error);
    }
  }

  return loadedModels;
}
