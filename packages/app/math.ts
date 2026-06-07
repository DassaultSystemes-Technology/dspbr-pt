export class Vec3 {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
  ) {}

  public set(x: number, y: number, z: number): this {
    this.x = x; this.y = y; this.z = z;
    return this;
  }

  public clone(): Vec3 { return new Vec3(this.x, this.y, this.z); }

  public copy(other: Vec3): this {
    this.x = other.x; this.y = other.y; this.z = other.z;
    return this;
  }

  public fromArray(values: ArrayLike<number>, offset = 0): this {
    this.x = values[offset + 0] ?? 0;
    this.y = values[offset + 1] ?? 0;
    this.z = values[offset + 2] ?? 0;
    return this;
  }

  public toArray(): [number, number, number] { return [this.x, this.y, this.z]; }

  public add(other: Vec3): this {
    this.x += other.x; this.y += other.y; this.z += other.z;
    return this;
  }

  public sub(other: Vec3): this {
    this.x -= other.x; this.y -= other.y; this.z -= other.z;
    return this;
  }

  public subVectors(a: Vec3, b: Vec3): this {
    this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z;
    return this;
  }

  public addScaledVector(other: Vec3, scale: number): this {
    this.x += other.x * scale;
    this.y += other.y * scale;
    this.z += other.z * scale;
    return this;
  }

  public multiplyScalar(scale: number): this {
    this.x *= scale; this.y *= scale; this.z *= scale;
    return this;
  }

  public dot(other: Vec3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  public crossVectors(a: Vec3, b: Vec3): this {
    const x = a.y * b.z - a.z * b.y;
    const y = a.z * b.x - a.x * b.z;
    const z = a.x * b.y - a.y * b.x;
    this.x = x; this.y = y; this.z = z;
    return this;
  }

  public lengthSq(): number { return this.x * this.x + this.y * this.y + this.z * this.z; }
  public length(): number { return Math.sqrt(this.lengthSq()); }

  public normalize(): this {
    const len = this.length();
    if (len > 1e-8) this.multiplyScalar(1 / len);
    return this;
  }

  public min(other: Vec3): this {
    this.x = Math.min(this.x, other.x);
    this.y = Math.min(this.y, other.y);
    this.z = Math.min(this.z, other.z);
    return this;
  }

  public max(other: Vec3): this {
    this.x = Math.max(this.x, other.x);
    this.y = Math.max(this.y, other.y);
    this.z = Math.max(this.z, other.z);
    return this;
  }
}

export class Mat4 {
  public readonly elements = new Float32Array(16);

  constructor() { this.identity(); }

  public identity(): this {
    const e = this.elements;
    e[0] = 1; e[4] = 0; e[8] = 0;  e[12] = 0;
    e[1] = 0; e[5] = 1; e[9] = 0;  e[13] = 0;
    e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
    e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
    return this;
  }

  public copy(other: Mat4): this { this.elements.set(other.elements); return this; }
}

export class Box3 {
  public min: Vec3;
  public max: Vec3;

  constructor() {
    this.min = new Vec3(+Infinity, +Infinity, +Infinity);
    this.max = new Vec3(-Infinity, -Infinity, -Infinity);
  }

  public isEmpty(): boolean {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }

  public expandByPoint(point: Vec3): this {
    this.min.min(point);
    this.max.max(point);
    return this;
  }

  public getCenter(target: Vec3): Vec3 {
    if (this.isEmpty()) return target.set(0, 0, 0);
    return target.set(
      (this.min.x + this.max.x) * 0.5,
      (this.min.y + this.max.y) * 0.5,
      (this.min.z + this.max.z) * 0.5,
    );
  }

  public getSize(): Vec3 {
    if (this.isEmpty()) return new Vec3();
    return new Vec3(
      this.max.x - this.min.x,
      this.max.y - this.min.y,
      this.max.z - this.min.z,
    );
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
