import * as THREE from 'three';
import { CollisionSystem, PlatformBody } from '../CollisionSystem';

export interface PlatformConfig {
  id: string;
  direction: THREE.Vector3;
  planetRadius?: number;
  width?: number;
  depth?: number;
  collisionWidth?: number;
  collisionDepth?: number;
  height?: number;
  collisionHeightScale?: number;
  thickness?: number;
  color?: number;
}

export class Platform {
  public readonly mesh: THREE.Mesh;
  public readonly collider: PlatformBody;
  private readonly normal: THREE.Vector3;
  private readonly planetRadius: number;
  private readonly thickness: number;

  constructor(config: PlatformConfig, collisionSystem: CollisionSystem) {
    const planetRadius = config.planetRadius ?? 10;
    const width = config.width ?? 3;
    const depth = config.depth ?? 3;
    const height = config.height ?? 1;
    const thickness = config.thickness ?? 0.35;
    const color = config.color ?? 0x886644;
    this.normal = config.direction.clone().normalize();
    this.planetRadius = planetRadius;
    this.thickness = thickness;
    const normal = this.normal;
    const reference = Math.abs(normal.y) > 0.95
      ? new THREE.Vector3(1, 0, 0)
      : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(reference, normal).normalize();
    const forward = new THREE.Vector3().crossVectors(right, normal).normalize();

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, thickness, depth),
      new THREE.MeshStandardMaterial({ color })
    );
    this.mesh.position.copy(normal)
      .multiplyScalar(planetRadius + height - thickness / 2);
    this.mesh.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(right, normal, forward)
    );

    this.collider = collisionSystem.addPlatform({
      id: config.id,
      normal,
      right,
      forward,
      width: config.collisionWidth ?? width,
      depth: config.collisionDepth ?? depth,
      height,
      planetRadius,
      collisionHeightScale: config.collisionHeightScale,
    });
  }

  public setHeight(height: number): void {
    this.collider.height = height;
    this.mesh.position.copy(this.normal)
      .multiplyScalar(this.planetRadius + height - this.thickness / 2);
  }
}
