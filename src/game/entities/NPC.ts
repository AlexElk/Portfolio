import * as THREE from 'three';
import { CollisionBody, CollisionSystem } from '../CollisionSystem';

export interface NPCConfig {
  id: string;
  name: string;
  lines: string[];
  direction: THREE.Vector3;
  planetRadius?: number;
  heightOffset?: number;
  size?: number;
  color?: number;
  collisionRadius?: number;
  modelFactory?: () => THREE.Object3D;
}

export interface NPCData {
  position: THREE.Vector3;
  name: string;
  lines: string[];
  projection?: THREE.Object3D;
}

export class NPC {
  public readonly mesh: THREE.Object3D;
  public readonly data: NPCData;
  public readonly collider: CollisionBody;

  constructor(config: NPCConfig, collisionSystem: CollisionSystem) {
    const planetRadius = config.planetRadius ?? 10;
    const heightOffset = config.heightOffset ?? 0.5;
    const size = config.size ?? 1;
    const color = config.color ?? 0x0088ff;
    const collisionRadius = config.collisionRadius ?? 0.55;
    const surfaceNormal = config.direction.clone().normalize();

    this.mesh = config.modelFactory?.() ?? new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshBasicMaterial({ color })
    );
    this.mesh.position.copy(surfaceNormal)
      .multiplyScalar(planetRadius + heightOffset);
    this.mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      surfaceNormal
    );

    this.data = {
      position: this.mesh.position,
      name: config.name,
      lines: config.lines,
    };
    this.collider = collisionSystem.addSphere(
      config.id,
      'NPC',
      this.mesh.position,
      collisionRadius
    );
  }
}
