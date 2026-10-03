import type * as THREE from 'three';
import type { CollisionSystem } from '../CollisionSystem';
import type { NPCData } from '../entities/NPC';
import type { HouseContent } from '../entities/House';
import type { FlatBounds } from '../FlatCollisionSystem';

export type WorldId = 'MENU' | 'OVERWORLD' | 'INTERIOR';

export interface InteractionTrigger {
  position: THREE.Vector3;
  promptPosition: THREE.Vector3;
  type: 'ENTER' | 'EXIT' | 'LINK';
  houseContent?: HouseContent;
  projection?: THREE.Object3D;
}

export interface WorldBuildContext {
  scene: THREE.Scene;
  collisionSystem: CollisionSystem;
}

export interface WorldOptions {
  houseContent?: HouseContent;
}

export interface WorldBuildResult {
  triggers: InteractionTrigger[];
  npcData: NPCData[];
  update?: (
    playerPosition: THREE.Vector3,
    delta: number,
    playerIsGrounded: boolean,
    playerCollisionRadius: number
  ) => void;
  player?: {
    visible?: boolean;
    spawnPosition?: THREE.Vector3;
    planetRadius?: number;
    movement?: { type: 'FLAT'; bounds: FlatBounds };
  };
  camera?: {
    mode: 'FLAT';
    position: THREE.Vector3;
    target: THREE.Vector3;
  };
}

export interface WorldDefinition {
  id: WorldId;
  build(context: WorldBuildContext, options?: WorldOptions): WorldBuildResult;
}