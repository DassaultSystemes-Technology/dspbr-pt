import { Mat4, Vec3 } from './math';

const WORLD_UP = new Vec3(0, 1, 0);
const FALLBACK_FORWARD = new Vec3(0, 0, -1);
const _right = new Vec3();
const _up = new Vec3();
const _backward = new Vec3();

export class PerspectiveCamera {
  public readonly position = new Vec3();
  public readonly matrixWorld = new Mat4();
  public readonly forward = new Vec3(0, 0, -1);
  public readonly right = new Vec3(1, 0, 0);
  public readonly up = new Vec3(0, 1, 0);

  constructor(
    public fov: number,
    public aspect: number,
    public near: number,
    public far: number,
  ) {
    this.updateMatrixWorld();
  }

  public lookAt(target: Vec3): void {
    this.forward.subVectors(target, this.position).normalize();
    if (this.forward.lengthSq() <= 1e-10) {
      this.forward.copy(FALLBACK_FORWARD);
    }
    _right.crossVectors(this.forward, WORLD_UP);
    if (_right.lengthSq() <= 1e-10) _right.set(1, 0, 0);
    _right.normalize();
    _up.crossVectors(_right, this.forward).normalize();
    this.right.copy(_right);
    this.up.copy(_up);
    this.updateMatrixWorld();
  }

  public getWorldDirection(target: Vec3): Vec3 {
    return target.copy(this.forward);
  }

  public updateMatrixWorld(): void {
    const e = this.matrixWorld.elements;
    _backward.copy(this.forward).multiplyScalar(-1);
    e[0] = this.right.x;    e[4] = this.up.x;    e[8] = _backward.x;  e[12] = this.position.x;
    e[1] = this.right.y;    e[5] = this.up.y;    e[9] = _backward.y;  e[13] = this.position.y;
    e[2] = this.right.z;    e[6] = this.up.z;    e[10] = _backward.z; e[14] = this.position.z;
    e[3] = 0;               e[7] = 0;            e[11] = 0;           e[15] = 1;
  }

  public updateProjectionMatrix(): void {}
}
