import {
  Scene,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Texture,
  // deprecated, todo: fix
  sRGBEncoding,
} from "three";

export class UIHandler {
  protected textureLoader: TextureLoader = new TextureLoader();
  protected uiScene: Scene;

  constructor(uiScene: Scene) {
    this.uiScene = uiScene;
  }

  async loadSprite(spriteName: string) {
    return new Promise<Sprite>((resolve, reject) => {
      this.textureLoader.load(
        `sprites/${spriteName}.png`,
        (texture) => {
          // @ts-ignore
          (texture as Texture).encoding = sRGBEncoding;
          const { width, height } = texture.image;
          const spriteMaterial = new SpriteMaterial({
            map: texture,
            color: 0xffffff,
          });
          const sprite = new Sprite(spriteMaterial);
          sprite.scale.set(width * 0.7, height * 0.7, 0.5);
          resolve(sprite);
        },
        undefined,
        (error) => {
          console.log(error);
          reject(error);
        }
      );
    });
  }

  async loadInventory() {
    const inventorySprites = [
      "inventory_pane",
      "inventory_column_left",
      "inventory_column_right",
      "inventory_tabs_top",
      "inventory_tabs_bottom",
    ];

    for (const sprite of inventorySprites) {
      try {
        const spriteInstance = await this.loadSprite(sprite);

        if (sprite === "inventory_column_left") {
          spriteInstance.position.set(900 - 155, 117, 0);
        } else if (sprite === "inventory_tabs_bottom") {
          spriteInstance.position.set(900 - 84, 13, 0);
        } else if (sprite === "inventory_tabs_top") {
          spriteInstance.position.set(900 - 84, 220, 0);
        } else if (sprite === "inventory_column_right") {
          spriteInstance.position.set(900 - 13, 117, 0);
        } else if (sprite === "inventory_pane") {
          spriteInstance.position.set(900 - 84, 117, 0);
          spriteInstance.scale.set(190 * 0.7, 261 * 0.8, 0.5); // Adjusted scale for pane
        }

        this.uiScene.add(spriteInstance);
      } catch (error) {
        console.error(`Error loading sprite ${sprite}:`, error);
      }
    }
  }
}
