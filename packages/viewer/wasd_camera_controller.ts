import { Vec3, clamp } from './math';
import { PerspectiveCamera } from './perspective_camera';

type CameraControlEvent = 'start' | 'change' | 'end';
type Listener = () => void;

const _forward = new Vec3();
const _right = new Vec3();
const _worldUp = new Vec3(0, 1, 0);
const _target = new Vec3();
const _orbitOffset = new Vec3();
const WHEEL_LINE_HEIGHT_PX = 16;
const WHEEL_IDLE_EPSILON = 0.0005;
const WHEEL_SMOOTHING_PER_SECOND = 18.0;

export class WasdCameraController {
  private readonly listeners = new Map<CameraControlEvent, Set<Listener>>();
  private readonly keyState = {
    forward: false, backward: false, left: false,
    right: false, up: false, down: false, fast: false,
  };
  private yaw = Math.PI;
  private pitch = 0;
  private dragging = false;
  private draggingButton = -1;
  private interactionActive = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private lastTouchDistance = 0;
  private readonly activeTouchPointers = new Map<number, { x: number; y: number }>();
  private rafId = 0;
  private lastTickTime = 0;
  private pendingWheelDistance = 0;
  private orbitTarget = new Vec3(0, 0, 0);

  public enabled = true;
  public autoRotate = false;
  public moveSpeed = 6.0;
  public fastMoveMultiplier = 4.0;
  public lookSpeed = 0.0035;
  public panSpeed = 0.002;
  public wheelSpeed = 0.001;
  public pinchZoomSpeed = 0.01;

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly domElement: HTMLElement,
  ) {
    this.syncAnglesFromCamera();
    this.attach();
    this.lastTickTime = performance.now();
    this.tick = this.tick.bind(this);
    this.rafId = requestAnimationFrame(this.tick);
  }

  public addEventListener(event: CameraControlEvent, listener: Listener) {
    const set = this.listeners.get(event) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(event, set);
  }

  public removeEventListener(event: CameraControlEvent, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  public dispose() {
    cancelAnimationFrame(this.rafId);
    this.detach();
  }

  public update() { return false; }

  public reset() { this.syncAnglesFromCamera(); }

  public setPose(position: Vec3, target: Vec3) {
    this.camera.position.copy(position);
    this.lookAt(target);
  }

  public lookAt(target: Vec3) {
    this.orbitTarget.copy(target);
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld();
    this.syncAnglesFromCamera();
    this.dispatch('change');
  }

  private attach() {
    this.domElement.addEventListener('contextmenu', this.onContextMenu);
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.domElement.addEventListener('wheel', this.onWheel, { passive: true });
  }

  private detach() {
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.domElement.removeEventListener('wheel', this.onWheel);
  }

  private readonly onContextMenu = (e: Event) => e.preventDefault();

  private readonly onPointerDown = (event: PointerEvent) => {
    if (!this.enabled) return;
    if (event.pointerType === 'touch') {
      event.preventDefault();
      this.activeTouchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    this.domElement.focus?.();
    this.domElement.setPointerCapture?.(event.pointerId);
    this.dragging = true;
    this.draggingButton = event.button;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    if (event.pointerType === 'touch' && this.activeTouchPointers.size >= 2) {
      this.lastTouchDistance = this.computeTouchDistance();
    }
    this.beginInteraction();
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (!this.enabled || !this.dragging) return;
    if (event.pointerType === 'touch') {
      event.preventDefault();
      this.activeTouchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.activeTouchPointers.size >= 2) {
        const next = this.computeTouchDistance();
        if (this.lastTouchDistance > 0 && next > 0) {
          this.camera.getWorldDirection(_forward);
          const delta = (next - this.lastTouchDistance) * this.pinchZoomSpeed;
          this.camera.position.addScaledVector(_forward, delta);
          this.camera.updateMatrixWorld();
          this.syncAnglesFromCamera();
          this.dispatch('change');
        }
        this.lastTouchDistance = next;
        return;
      }
    }
    const dx = event.clientX - this.lastPointerX;
    const dy = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    if (this.draggingButton === 2) {
      this.applyPan(dx, dy);
    } else if (this.draggingButton === 0) {
      this.applyOrbit(dx, dy);
    } else {
      this.yaw -= dx * this.lookSpeed;
      this.pitch = clamp(this.pitch - dy * this.lookSpeed, -Math.PI * 0.495, Math.PI * 0.495);
      this.updateCameraOrientation();
    }
    this.dispatch('change');
  };

  private readonly onPointerUp = (event?: PointerEvent) => {
    if (!this.dragging) return;
    if (event?.pointerType === 'touch') {
      event.preventDefault();
      if (typeof event.pointerId === 'number') this.activeTouchPointers.delete(event.pointerId);
    }
    if (typeof event?.pointerId === 'number' && this.domElement.hasPointerCapture?.(event.pointerId)) {
      this.domElement.releasePointerCapture?.(event.pointerId);
    }
    if (this.activeTouchPointers.size >= 2) {
      this.lastTouchDistance = this.computeTouchDistance();
      return;
    }
    if (this.activeTouchPointers.size === 1) {
      const t = this.activeTouchPointers.values().next().value;
      if (t) { this.lastPointerX = t.x; this.lastPointerY = t.y; }
      this.lastTouchDistance = 0;
      return;
    }
    this.lastTouchDistance = 0;
    this.dragging = false;
    this.draggingButton = -1;
    this.endInteractionIfIdle();
  };

  private readonly onWheel = (event: WheelEvent) => {
    if (!this.enabled) return;
    this.beginInteraction();
    this.pendingWheelDistance += -this.normalizeWheelDeltaY(event) * this.wheelSpeed;
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!this.enabled || this.isEditingElement(event.target)) return;
    if (this.setKeyState(event.code, true)) this.beginInteraction();
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    if (this.setKeyState(event.code, false)) this.endInteractionIfIdle();
  };

  private tick(now: number) {
    const dt = Math.min((now - this.lastTickTime) / 1000, 0.05);
    this.lastTickTime = now;
    if (this.enabled) {
      let changed = false;
      if (this.autoRotate) { this.yaw += dt * 0.35; changed = true; }
      const moveScale = this.moveSpeed * dt * (this.keyState.fast ? this.fastMoveMultiplier : 1.0);
      if (moveScale > 0 && this.hasMovementInput()) {
        this.camera.getWorldDirection(_forward).normalize();
        _right.crossVectors(_forward, _worldUp).normalize();
        if (this.keyState.forward) this.camera.position.addScaledVector(_forward, moveScale);
        if (this.keyState.backward) this.camera.position.addScaledVector(_forward, -moveScale);
        if (this.keyState.right) this.camera.position.addScaledVector(_right, moveScale);
        if (this.keyState.left) this.camera.position.addScaledVector(_right, -moveScale);
        if (this.keyState.up) this.camera.position.addScaledVector(_worldUp, moveScale);
        if (this.keyState.down) this.camera.position.addScaledVector(_worldUp, -moveScale);
        changed = true;
      }
      if (Math.abs(this.pendingWheelDistance) > WHEEL_IDLE_EPSILON) {
        this.camera.getWorldDirection(_forward).normalize();
        const smoothing = 1.0 - Math.exp(-WHEEL_SMOOTHING_PER_SECOND * dt);
        const dist = this.pendingWheelDistance * smoothing;
        this.pendingWheelDistance -= dist;
        this.camera.position.addScaledVector(_forward, dist);
        this.camera.updateMatrixWorld();
        this.syncAnglesFromCamera();
        changed = true;
      } else if (this.pendingWheelDistance !== 0) {
        this.pendingWheelDistance = 0;
        this.endInteractionIfIdle();
      }
      if (changed) { this.updateCameraOrientation(); this.dispatch('change'); }
    }
    this.rafId = requestAnimationFrame(this.tick);
  }

  private applyPan(dx: number, dy: number) {
    this.camera.getWorldDirection(_forward).normalize();
    _right.crossVectors(_forward, _worldUp).normalize();
    const scale = this.panSpeed * (this.camera.position.length() + 1.0);
    this.camera.position.addScaledVector(_right, -dx * scale);
    this.camera.position.addScaledVector(_worldUp, dy * scale);
    this.orbitTarget.addScaledVector(_right, -dx * scale);
    this.orbitTarget.addScaledVector(_worldUp, dy * scale);
    this.camera.updateMatrixWorld();
    this.syncAnglesFromCamera();
  }

  private applyOrbit(dx: number, dy: number) {
    _orbitOffset.copy(this.camera.position).sub(this.orbitTarget);
    let radius = _orbitOffset.length();
    if (radius <= 1e-5) { radius = 1; _orbitOffset.set(0, 0, radius); }
    const orbitYaw = Math.atan2(_orbitOffset.x, _orbitOffset.z) - dx * this.lookSpeed;
    const orbitPitch = clamp(
      Math.asin(clamp(_orbitOffset.y / radius, -1.0, 1.0)) + dy * this.lookSpeed,
      -Math.PI * 0.495, Math.PI * 0.495,
    );
    const cosPitch = Math.cos(orbitPitch);
    _orbitOffset.set(
      Math.sin(orbitYaw) * cosPitch * radius,
      Math.sin(orbitPitch) * radius,
      Math.cos(orbitYaw) * cosPitch * radius,
    );
    this.camera.position.copy(this.orbitTarget).add(_orbitOffset);
    this.camera.lookAt(this.orbitTarget);
    this.camera.updateMatrixWorld();
    this.syncAnglesFromCamera();
  }

  private updateCameraOrientation() {
    const cosPitch = Math.cos(this.pitch);
    _target.set(
      Math.sin(this.yaw) * cosPitch,
      Math.sin(this.pitch),
      Math.cos(this.yaw) * cosPitch,
    ).add(this.camera.position);
    this.camera.lookAt(_target);
    this.camera.updateMatrixWorld();
  }

  private syncAnglesFromCamera() {
    this.camera.getWorldDirection(_forward).normalize();
    this.pitch = Math.asin(clamp(_forward.y, -1.0, 1.0));
    this.yaw = Math.atan2(_forward.x, _forward.z);
  }

  private beginInteraction() {
    if (this.interactionActive) return;
    this.interactionActive = true;
    this.dispatch('start');
  }

  private endInteractionIfIdle() {
    if (!this.interactionActive || this.dragging || this.hasMovementInput()) return;
    this.interactionActive = false;
    this.dispatch('end');
  }

  private computeTouchDistance() {
    const touches = Array.from(this.activeTouchPointers.values());
    if (touches.length < 2) return 0;
    return Math.hypot(touches[1]!.x - touches[0]!.x, touches[1]!.y - touches[0]!.y);
  }

  private normalizeWheelDeltaY(event: WheelEvent) {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * WHEEL_LINE_HEIGHT_PX;
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * this.domElement.clientHeight;
    return event.deltaY;
  }

  private hasMovementInput() {
    return this.keyState.forward || this.keyState.backward || this.keyState.left
      || this.keyState.right || this.keyState.up || this.keyState.down;
  }

  private setKeyState(code: string, value: boolean): boolean {
    const map: Record<string, keyof WasdCameraController['keyState']> = {
      KeyW: 'forward', KeyS: 'backward', KeyA: 'left', KeyD: 'right',
      KeyQ: 'down', KeyE: 'up', ShiftLeft: 'fast', ShiftRight: 'fast',
    };
    const key = map[code];
    if (!key || this.keyState[key] === value) return false;
    this.keyState[key] = value;
    return true;
  }

  private dispatch(event: CameraControlEvent) {
    for (const listener of this.listeners.get(event) ?? []) listener();
  }

  private isEditingElement(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }
}
