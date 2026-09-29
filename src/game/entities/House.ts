import * as THREE from 'three';
import { CollisionBody, CollisionSystem } from '../CollisionSystem';

export interface HouseContent {
  name: string;
  interiorColor: number;
  url: string;
  imageUrl: string;
}

export interface HouseConfig {
  id: string;
  direction: THREE.Vector3;
  planetRadius?: number;
  heightOffset?: number;
  size?: number;
  color?: number;
  collisionRadius?: number;
  modelFactory?: () => THREE.Object3D;
  content: HouseContent;
}

export class House {
  public readonly mesh: THREE.Object3D;
  public readonly surfaceNormal: THREE.Vector3;
  public readonly triggerPosition: THREE.Vector3;
  public readonly promptPosition: THREE.Vector3;
  public readonly collider: CollisionBody;
  public readonly content: HouseContent;

  constructor(config: HouseConfig, collisionSystem: CollisionSystem) {
    const planetRadius = config.planetRadius ?? 10;
    const heightOffset = config.heightOffset ?? 1.25;
    const size = config.size ?? 2.5;
    const color = config.color ?? 0xaa4444;
    const collisionRadius = config.collisionRadius ?? 1.25;
    this.content = config.content;

    this.surfaceNormal = config.direction.clone().normalize();
    this.mesh = config.modelFactory?.() ?? new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshStandardMaterial({ color })
    );
    this.mesh.position.copy(this.surfaceNormal)
      .multiplyScalar(planetRadius + heightOffset);
    this.mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      this.surfaceNormal
    );

    this.triggerPosition = this.surfaceNormal.clone()
      .multiplyScalar(planetRadius + 0.5);
    this.promptPosition = this.surfaceNormal.clone()
      .multiplyScalar(planetRadius + 3.2);
    this.collider = collisionSystem.addSphere(
      config.id,
      'HOUSE',
      this.mesh.position,
      collisionRadius
    );
  }
}
