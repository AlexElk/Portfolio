import * as THREE from 'three';
import { interiorConfig } from './config';
import type { WorldDefinition } from '../types';

export const interiorWorld: WorldDefinition = {
  id: 'INTERIOR',
  build({ scene }, options) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(interiorConfig.floorSize, interiorConfig.floorSize),
      new THREE.MeshStandardMaterial({ color: interiorConfig.floorColor, side: THREE.DoubleSide })
    );
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    const interiorObject = new THREE.Mesh(
      new THREE.BoxGeometry(interiorConfig.objectSize, interiorConfig.objectSize, interiorConfig.objectSize),
      new THREE.MeshStandardMaterial({
        color: options?.houseContent?.interiorColor ?? interiorConfig.defaultObjectColor,
      })
    );
    interiorObject.position.set(0, interiorConfig.objectSize / 2, 0);
    interiorObject.userData.houseContent = options?.houseContent;
    scene.add(interiorObject);

    const halfSize = interiorConfig.floorSize / 2;
    const wallMaterial = new THREE.MeshStandardMaterial({ color: interiorConfig.wallColor });
    const addWall = (width: number, depth: number, x: number, z: number) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(width, interiorConfig.wallHeight, depth),
        wallMaterial
      );
      wall.position.set(x, interiorConfig.wallHeight / 2, z);
      scene.add(wall);
    };

    addWall(interiorConfig.floorSize, interiorConfig.wallThickness, 0, -halfSize);
    addWall(interiorConfig.wallThickness, interiorConfig.floorSize, -halfSize, 0);
    addWall(interiorConfig.wallThickness, interiorConfig.floorSize, halfSize, 0);

    return {
      triggers: [
        {
          position: new THREE.Vector3(0, 0.5, 3),
          promptPosition: new THREE.Vector3(0, 2, 3.5),
          type: 'EXIT',
        },
        ...(options?.houseContent ? [{
          position: new THREE.Vector3(0, 0.5, 0),
          promptPosition: new THREE.Vector3(0, 2, 0),
          type: 'LINK' as const,
          houseContent: options.houseContent,
        }] : []),
      ],
      npcData: [],
      player: {
        spawnPosition: new THREE.Vector3(0, 0.5, 2),
        movement: { type: 'FLAT', bounds: interiorConfig.bounds },
      },
      camera: {
        mode: 'FLAT',
        position: new THREE.Vector3(0, 5.5, 8),
        target: new THREE.Vector3(0, 0.8, 0),
      },
    };
  },
};