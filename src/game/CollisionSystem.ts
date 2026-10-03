import * as THREE from 'three';

export type ColliderType = 'PLAYER' | 'NPC' | 'HOUSE';

export interface CollisionBody {
  id: string;
  type: ColliderType;
  position: THREE.Vector3;
  radius: number;
  surfaceRadius?: number;
}

export interface PlatformBody {
  id: string;
  normal: THREE.Vector3;
  right: THREE.Vector3;
  forward: THREE.Vector3;
  width: number;
  depth: number;
  height: number;
  planetRadius: number;
  collisionHeightScale?: number;
}

export class CollisionSystem {
  private bodies = new Map<string, CollisionBody>();
  private platforms = new Map<string, PlatformBody>();

  public addSphere(
    id: string,
    type: ColliderType,
    position: THREE.Vector3,
    radius: number,
    surfaceRadius?: number
  ): CollisionBody {
    const body: CollisionBody = { id, type, position, radius, surfaceRadius };
    this.bodies.set(id, body);
    return body;
  }

  public remove(id: string): void {
    this.bodies.delete(id);
    this.platforms.delete(id);
  }

  public addPlatform(platform: PlatformBody): PlatformBody {
    this.platforms.set(platform.id, platform);
    return platform;
  }

  public getPlatformSupportHeight(
    playerNormal: THREE.Vector3,
    planetRadius: number,
    playerRadius: number
  ): number {
    let supportHeight = 0;

    for (const platform of this.platforms.values()) {
      if (platform.planetRadius !== planetRadius) continue;
      if (playerNormal.dot(platform.normal) <= 0) continue;

      const collisionRadius = planetRadius
        + platform.height * (platform.collisionHeightScale ?? 0);
      const offset = playerNormal.clone()
        .sub(platform.normal)
        .multiplyScalar(collisionRadius);
      const localX = offset.dot(platform.right);
      const localZ = offset.dot(platform.forward);
      const halfWidth = platform.width / 2 + playerRadius;
      const halfDepth = platform.depth / 2 + playerRadius;

      if (Math.abs(localX) <= halfWidth && Math.abs(localZ) <= halfDepth) {
        supportHeight = Math.max(supportHeight, platform.height);
      }
    }

    return supportHeight;
  }

  public resolvePosition(body: CollisionBody, desiredPosition: THREE.Vector3): THREE.Vector3 {
    const resolvedPosition = desiredPosition.clone();
    this.constrainToSurface(resolvedPosition, body.surfaceRadius);

    for (let pass = 0; pass < 3; pass++) {
      for (const other of this.bodies.values()) {
        if (other.id === body.id) continue;

        const offset = resolvedPosition.clone().sub(other.position);
        const distance = offset.length();
        const minimumDistance = body.radius + other.radius;

        if (distance >= minimumDistance) continue;

        if (distance > 1e-6) {
          offset.multiplyScalar(1 / distance);
        } else {
          offset.copy(body.position).sub(other.position).normalize();
          if (offset.lengthSq() < 1e-6) offset.set(1, 0, 0);
        }

        resolvedPosition.copy(other.position)
          .addScaledVector(offset, minimumDistance);
        this.constrainToSurface(resolvedPosition, body.surfaceRadius);
      }
    }

    return resolvedPosition;
  }

  private constrainToSurface(position: THREE.Vector3, surfaceRadius?: number): void {
    if (surfaceRadius === undefined || position.lengthSq() < 1e-6) return;

    position.normalize().multiplyScalar(surfaceRadius);
  }
}
