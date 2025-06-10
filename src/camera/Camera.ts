import { OrthographicCamera, PerspectiveCamera } from "three";
import { Player } from "../Player";

export class PlayerCamera {
  protected camera = new PerspectiveCamera();

  protected CAMERA_DISTANCE: number = 6;
  protected CAMERA_MIN_DISTANCE = 3;
  protected CAMERA_MAX_DISTANCE = 18;
  protected CAMERA_PITCH = Math.PI / 4;
  protected CAMERA_MIN_PITCH = Math.PI / 8; 
  protected CAMERA_MAX_PITCH = Math.PI / 2.1;
  protected CAMERA_YAW = Math.PI / 5; 

  constructor() {}

  updatePosition(player: Player) {
    const playerPos = player.instance
      ? player.instance.position
      : { x: 0, y: 0, z: 0 };

    const x =
      playerPos.x +
      this.CAMERA_DISTANCE * Math.sin(this.CAMERA_PITCH) * Math.sin(this.CAMERA_YAW);
    const y = playerPos.y + this.CAMERA_DISTANCE * Math.cos(this.CAMERA_PITCH);
    const z =
      playerPos.z +
      this.CAMERA_DISTANCE * Math.sin(this.CAMERA_PITCH) * Math.cos(this.CAMERA_YAW);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
  }
}
