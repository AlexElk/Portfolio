import * as THREE from 'three';
import type { WorldDefinition } from '../types';

export const menuWorld: WorldDefinition = {
  id: 'MENU',
  build({ scene }) {
    const grid = new THREE.GridHelper(20, 20, 0x00ff88, 0x444444);
    scene.add(grid);

    const menuCube = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x00ff88 })
    );
    menuCube.position.set(0, 1.2, 0);
    scene.add(menuCube);

    return { triggers: [], npcData: [] };
  },
};