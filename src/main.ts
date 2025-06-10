import * as THREE from "three";

import "./style.css";
import { Player } from "./Player";
import { ModelHandler } from "./ModelHandler";
import { EarthWave } from "./spells/EarthWave";
import { UIHandler } from "./UIHandler";
import { WorldObject } from "./WorldObject";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { objects } from "./generated/Objects";
import { npcs } from "./generated/Npcs";
import { NPC } from "./Npc";
import { tileDataForCoordinate } from "./map/RemoveLater";

const canvas = document.querySelector("#app") as HTMLCanvasElement;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  GAME_WIDTH / GAME_HEIGHT,
  0.1,
  1000
);

/* camera.position.set(0, 5, 5);
camera.lookAt(0, 0, 0); */

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(GAME_WIDTH, GAME_HEIGHT); // Fixed size
renderer.outputColorSpace = THREE.SRGBColorSpace;

window.addEventListener("resize", () => {
  camera.aspect = 1;
  camera.updateProjectionMatrix();
  renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
});

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const modelHandler = new ModelHandler();

await modelHandler.loadModels();

const clock = new THREE.Clock();

const player = new Player(modelHandler);

player.render(scene);
player.playAnimation(1);
const playerLoc = player.getLocation();

const trainingDummy = new WorldObject(modelHandler, 25177)
  .setLocation({ x: 0, y: 0, z: playerLoc.z + 5 })
  .render(scene);

const uiScene = new THREE.Scene();
const uiCamera = new THREE.OrthographicCamera(0, 900, 600, 0, -1, 1);

const uiHandler = new UIHandler(uiScene);

await uiHandler.loadInventory();

const GAME_TILES_X = 64;
const GAME_TILES_Y = 64;
const TILE_SIZE = 1;

for (let x = 0; x < GAME_TILES_X; x++) {
  for (let y = 0; y < GAME_TILES_Y; y++) {
    const tileId = tileDataForCoordinate(x, y);

    let hexColor: any = null;

    if (tileId) {
      let colorDecimal = null;

      if (tileId === 1) {
        colorDecimal = 12047514;
      } else if (tileId === 4) {
        colorDecimal = 6307904;
      } else if (tileId === 5) {
        colorDecimal = 3153952;
      } else {
        console.warn(`Unknown tile ID: ${tileId} at (${x}, ${y})`);
      }

      if (colorDecimal) {
        hexColor = "#" + colorDecimal.toString(16).padStart(6, "0");
      }
    }

    const tileGeometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
    const tileMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(hexColor || 0x390000),
      side: THREE.DoubleSide,
    });

    const tile = new THREE.Mesh(tileGeometry, tileMaterial);
    tile.position.set(
      x,
      0.1,
      GAME_TILES_Y - 1 - y // Flip Y to match OSRS bottom-left origin
    );
    tile.rotation.x = Math.PI / 2;
    tile.name = `tile_${x}_${y}`;
    scene.add(tile);

    const outlineGeometry = new THREE.EdgesGeometry(tileGeometry);
    const outlineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 2,
      depthTest: false, // Always render on top
    });
    const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial);
    outline.position.copy(tile.position);
    outline.rotation.copy(tile.rotation);
    outline.renderOrder = 999; // Ensure it's rendered last
    scene.add(outline);

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    const label = `(${x}, ${y})`;
    ctx.strokeText(label.toString(), 32, 32);
    ctx.fillText(label.toString(), 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.2, 0.2, 0.2);
    sprite.position.set(tile.position.x, tile.position.y + 2, tile.position.z);
    scene.add(sprite);
  }
}

const worldObjects: WorldObject[] = [];

for (const object of objects) {
  let objectId = object.id;
  let isWall = false;

  if (object.id === 1911) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 678;
        break;
      case 1:
        objectId = 679;
        break;
      case 2:
        objectId = 636;
        break;
      case 3:
        objectId = 637;
        break;
      case 9:
        objectId = 638;
        break;
    }
  } else if (object.id === 1902) {
    isWall = true;

    switch (object.type) {
      case 0:
        objectId = 634;
        break;
      case 1:
        objectId = 635;
        break;
      case 2:
        objectId = 574;
        break;
      case 3:
        objectId = 575;
        break;
      case 9:
        objectId = 576;
        break;
    }
  } else if (object.id === 1631) {
    isWall = true;

    switch (object.type) {
      case 0:
        objectId = 634;
        break;
      case 1:
        objectId = 635;
        break;
      case 2:
        objectId = 574;
        break;
      case 3:
        objectId = 575;
        break;
      case 9:
        objectId = 576;
        break;
    }
  } else if (object.id === 980) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 1009;
        break;
      case 1:
        objectId = 1010;
        break;
      case 2:
        objectId = 1011;
        break;
      case 3:
        objectId = 1012;
        break;
      case 9:
        objectId = 1013;
        break;
    }
  } else if (object.id === 814) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 993;
        break;
      case 1:
        objectId = 995;
        break;
      case 2:
        objectId = 996;
        break;
      case 3:
        objectId = 998;
        break;
      case 9:
        objectId = 999;
        break;
    }
  } else if (object.id === 1626) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 844;
        break;
      case 1:
        objectId = 845;
        break;
      case 2:
        objectId = 846;
        break;
      case 3:
        objectId = 847;
        break;
      case 9:
        objectId = 848;
        break;
      case 10:
        objectId = 862;
        break;
    }
  } else if (object.id === 1624) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 849;
        break;
      case 1:
        objectId = 850;
        break;
      case 2:
        objectId = 851;
        break;
      case 3:
        objectId = 852;
        break;
      case 9:
        objectId = 853;
        break;
    }
  } else if (object.id === 1545) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 634;
        break;
      case 1:
        objectId = 635;
        break;
      case 2:
        objectId = 574;
        break;
      case 3:
        objectId = 575;
        break;
      case 9:
        objectId = 576;
        break;
    }
  } else if (object.id === 1625) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 849;
        break;
      case 1:
        objectId = 850;
        break;
      case 2:
        objectId = 851;
        break;
      case 3:
        objectId = 852;
        break;
      case 9:
        objectId = 853;
        break;
    }
  } else if (object.id === 1912) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 646;
        break;
      case 1:
        objectId = 647;
        break;
      case 2:
        objectId = 648;
        break;
      case 3:
        objectId = 649;
        break;
      case 9:
        objectId = 650;
        break;
    }
  } else if (object.id === 981) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 960;
        break;
      case 1:
        objectId = 961;
        break;
      case 2:
        objectId = 962;
        break;
      case 3:
        objectId = 963;
        break;
      case 9:
        objectId = 964;
        break;
    }
  } else if (object.id === 12983) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 7373;
        break;
      case 1:
        objectId = 7374;
        break;
      case 2:
        objectId = 7375;
        break;
      case 3:
        objectId = 7376;
        break;
      case 9:
        objectId = 7377;
        break;
    }
  }else if (object.id === 3457) {
    isWall = true;
    switch (object.type) {
      case 0:
        objectId = 3531;
        break;
      case 2:
        objectId = 3532;
        break;
      case 3:
        objectId = 3533;
        break;
      case 9:
        objectId = 3534;
        break;
    }
  }

  const wo = new WorldObject(
    modelHandler,
    objectId,
    isWall ? object.type : undefined
  )
    .setLocation({
      x: object.x,
      y: 0,
      z: GAME_TILES_Y - 1 - object.y, // Flip Y to match OSRS bottom-left origin
    })
    .setRotation(object.direction)
    .render(scene);
  worldObjects.push(wo);
}

const spawnedNPCs: NPC[] = [];

for (const npc of npcs) {
  const spawnedNpc = new NPC(modelHandler, npc.id, {
    x: npc.x - 3200,
    y: 0,
    z: GAME_TILES_Y - 1 - (npc.y - 3200), // Flip Y to match OSRS bottom-left origin
  })
    .render(scene)
    .playAnimation(0);

  spawnedNPCs.push(spawnedNpc);
}

/**
 * Camera stuff, TODO: Move to Camera class, support multiple cameras (ie. cinematic camera)
 */
let CAMERA_DISTANCE = 6;
let CAMERA_MIN_DISTANCE = 3;
let CAMERA_MAX_DISTANCE = 18;

let CAMERA_PITCH = Math.PI / 4;
let CAMERA_MIN_PITCH = Math.PI / 8;
let CAMERA_MAX_PITCH = Math.PI / 2.1;

let CAMERA_YAW = Math.PI / 5;

function updateCameraPosition() {
  const playerPos = player.instance
    ? player.instance.position
    : { x: 0, y: 0, z: 0 };

  const x =
    playerPos.x +
    CAMERA_DISTANCE * Math.sin(CAMERA_PITCH) * Math.sin(CAMERA_YAW);
  const y = playerPos.y + CAMERA_DISTANCE * Math.cos(CAMERA_PITCH);
  const z =
    playerPos.z +
    CAMERA_DISTANCE * Math.sin(CAMERA_PITCH) * Math.cos(CAMERA_YAW);

  camera.position.set(x, y, z);
  camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
}

let isMiddleMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 1) {
    isMiddleMouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    e.preventDefault();
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (e.button === 1) {
    isMiddleMouseDown = false;
    e.preventDefault();
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isMiddleMouseDown) {
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    CAMERA_YAW -= deltaX * 0.008;
    CAMERA_PITCH -= deltaY * 0.008;
    CAMERA_PITCH = Math.max(
      CAMERA_MIN_PITCH,
      Math.min(CAMERA_MAX_PITCH, CAMERA_PITCH)
    );

    updateCameraPosition();
  }

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  let hoveringPlayer = false;
  let hoveringObject = false;
  if (player.instance) {
    const intersectsPlayer = raycaster.intersectObject(player.instance, true);
    const intersectsObject = raycaster.intersectObjects(
    worldObjects.map((wo) => wo.instance!),
    true
  );
    if (intersectsPlayer.length > 0) {
      hoveringPlayer = true;
      document.body.style.cursor = "pointer";
      const tooltip = document.getElementById("tooltip");
      if (tooltip) {
        tooltip.innerText = "Weeehhooooo";
        tooltip.style.display = "block";
        tooltip.style.left = `${e.clientX + 12}px`;
        tooltip.style.top = `${e.clientY + 12}px`;
      }
    } else if (intersectsObject.length > 0) {
      hoveringObject = true;
      document.body.style.cursor = "pointer";
      const tooltip = document.getElementById("tooltip");
      if (tooltip) {
        tooltip.innerText = `Model ID: ${worldObjects.find(wo => wo.getInstanceId() === intersectsObject[0].object.parent?.id)?.getModelId()}`;
        tooltip.style.display = "block";
        tooltip.style.left = `${e.clientX + 12}px`;
        tooltip.style.top = `${e.clientY + 12}px`;
      }
    } else {
      hoveringPlayer = false;
      hoveringObject = false;
      document.body.style.cursor = "default";

      const tooltip = document.getElementById("tooltip");
      if (tooltip) tooltip.style.display = "none";
    }
  }

  if (!hoveringPlayer && !hoveringObject) {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) tooltip.style.display = "none";
  }
});

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    CAMERA_DISTANCE += e.deltaY * 0.01;
    CAMERA_DISTANCE = Math.max(
      CAMERA_MIN_DISTANCE,
      Math.min(CAMERA_MAX_DISTANCE, CAMERA_DISTANCE)
    );
    updateCameraPosition();
  },
  { passive: false }
);

const CLICK_ANIMATION_FRAMES = 4;
const CLICK_ANIMATION_FPS = 20;
const clickTextures: THREE.Texture[] = [];
const clickActionTextures: THREE.Texture[] = [];

let clickTexturesLoaded = false;
let clickActionTexturesLoaded = false;

/* TODO: Load every texture at the beginning, make reusable, this is disgusting */
function preloadClickTextures() {
  const loader = new THREE.TextureLoader();
  let loaded = 0;
  for (let i = 0; i < CLICK_ANIMATION_FRAMES; i++) {
    loader.load(`sprites/cursor_click_${i + 1}.png`, (texture) => {
      clickTextures[i] = texture;
      loaded++;
      if (loaded === CLICK_ANIMATION_FRAMES) clickTexturesLoaded = true;
    });
  }
}
preloadClickTextures();

function preloadClickActionTextures() {
  const loader = new THREE.TextureLoader();
  let loaded = 0;
  for (let i = 0; i < CLICK_ANIMATION_FRAMES; i++) {
    loader.load(`sprites/cursor_click_action_${i + 1}.png`, (texture) => {
      clickActionTextures[i] = texture;
      loaded++;
      if (loaded === CLICK_ANIMATION_FRAMES) clickActionTexturesLoaded = true;
    });
  }
}
preloadClickActionTextures();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

type ClickEffect = {
  sprite: THREE.Sprite;
  frame: number;
  time: number;
};
const clickEffects: ClickEffect[] = [];
const actionClickEffects: ClickEffect[] = [];

let playerTarget: THREE.Vector3 | null = null;
const PLAYER_SPEED = 5;

const spells: any = [];

canvas.addEventListener("click", (e) => {
  if (!clickTexturesLoaded || !clickActionTexturesLoaded) return;

  // Convert mouse to normalized device coordinates
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(
    scene.children.filter((obj) => obj.name.startsWith("tile_")),
    true
  );

  const intersectsDummy = raycaster.intersectObject(
    trainingDummy.instance!,
    true
  );

  if (intersectsDummy.length > 0) {
    const playerLocation = player.instance!.position;

    const wave = new EarthWave(modelHandler)
      .spawn({
        x: playerLocation.x,
        y: playerLocation.y + 0.5,
        z: playerLocation.z,
      })
      .setTarget(intersectsDummy[0].point);
    wave.render(scene);
    wave.instance!.lookAt(
      intersectsDummy[0].point.x,
      intersectsDummy[0].point.y,
      intersectsDummy[0].point.z
    );
    wave.onHit(() => {
      const index = spells.indexOf(wave);
      if (index > -1) {
        spells.splice(index, 1);
      }
      wave.destroy();
    });

    spells.push(wave);

    const spriteMaterial = new THREE.SpriteMaterial({
      map: clickActionTextures[0],
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(intersects[0].point);
    sprite.position.y += 0.01 + 0.1;
    sprite.scale.set(0.15, 0.15, 0.15);

    scene.add(sprite);

    actionClickEffects.push({ sprite, frame: 0, time: 0 });
    return;
  }

  if (intersects.length > 0) {
    const tile = intersects[0].object as THREE.Mesh;

    const tilePosition = tile.position.clone();

    const clone = tile.position.clone();
    clone.x = Math.round(tilePosition.x);
    clone.z = Math.round(tilePosition.z);
    clone.y = tilePosition.y + 0.075;

    playerTarget = clone;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: clickTextures[0],
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(intersects[0].point);
    sprite.position.y += 0.01 + 0.1;
    sprite.scale.set(0.15, 0.15, 0.15);

    scene.add(sprite);

    clickEffects.push({ sprite, frame: 0, time: 0 });
  }
});

let isWalking = false;

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();

  if (playerTarget && player.instance) {
    const pos = player.instance.position;
    const dir = new THREE.Vector3().subVectors(playerTarget, pos);
    const dist = dir.length();
    if (dist > 0.05) {
      dir.normalize();
      const step = Math.min(dist, PLAYER_SPEED * dt);
      pos.addScaledVector(dir, step);
      player.instance.lookAt(playerTarget.x, pos.y, playerTarget.z);

      if (!isWalking) {
        player.playAnimation(4);
        isWalking = true;
      }
    } else {
      playerTarget = null; // docArrive

      if (isWalking) {
        player.playAnimation(1);
        isWalking = false;
        // console.log("Position is now", pos);
      }
    }
  }

  player.update(dt);
  for (const spell of spells) {
    spell.update(dt);
  }

  for (const npc of spawnedNPCs) {
    npc.update(dt);
  }

  for (let i = clickEffects.length - 1; i >= 0; i--) {
    const effect = clickEffects[i];
    effect.time += dt;
    const nextFrame = Math.floor(effect.time * CLICK_ANIMATION_FPS);
    if (nextFrame !== effect.frame && nextFrame < CLICK_ANIMATION_FRAMES) {
      effect.frame = nextFrame;
      effect.sprite.material.map = clickTextures[effect.frame];
      effect.sprite.material.needsUpdate = true;
    }
    if (nextFrame >= CLICK_ANIMATION_FRAMES) {
      scene.remove(effect.sprite);
      clickEffects.splice(i, 1);
    }
  }

  for (let i = actionClickEffects.length - 1; i >= 0; i--) {
    const effect = actionClickEffects[i];
    effect.time += dt;
    const nextFrame = Math.floor(effect.time * CLICK_ANIMATION_FPS);
    if (nextFrame !== effect.frame && nextFrame < CLICK_ANIMATION_FRAMES) {
      effect.frame = nextFrame;
      effect.sprite.material.map = clickActionTextures[effect.frame];
      effect.sprite.material.needsUpdate = true;
    }
    if (nextFrame >= CLICK_ANIMATION_FRAMES) {
      scene.remove(effect.sprite);
      actionClickEffects.splice(i, 1);
    }
  }

  updateCameraPosition();

  renderer.autoClear = true;
  renderer.render(scene, camera);
  renderer.autoClear = false;
  renderer.clearDepth();
  renderer.render(uiScene, uiCamera);
}
animate();
