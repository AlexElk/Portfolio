import * as THREE from 'three';
import { CollisionSystem } from './CollisionSystem';
import { FlatBounds } from './FlatCollisionSystem';
import { House, HouseContent } from './entities/House';
import { NPC } from './entities/NPC';
import { Platform } from './entities/Platform';
import { plane } from 'three/examples/jsm/Addons.js';
import { publicAssetUrl } from './assets';

export type { NPCData } from './entities/NPC';
export type { HouseContent } from './entities/House';

export interface HouseTrigger {
  position: THREE.Vector3;
  promptPosition: THREE.Vector3;
  type: 'ENTER' | 'EXIT' | 'LINK';
  houseContent?: HouseContent;
}

export function alignToSphere(
  object: THREE.Object3D,
  dir: THREE.Vector3,
  radius: number = 10,
  offsetHeight: number = 0
){
  const normal = dir.clone().normalize();
  object.position.copy(normal.clone().multiplyScalar(radius + offsetHeight));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  object.quaternion.copy(q);
}

export function setupOverworldScene(scene: THREE.Scene, collisionSystem: CollisionSystem) {

  const PLANET_RADIUS = 10;
  scene.background = new THREE.Color(0x020208);

  //Textur
  const textureLoader = new THREE.TextureLoader();

  //Lade das Bild aus dem Public-Ordner
  const planetTexture = textureLoader.load(publicAssetUrl('/textures/rocky_terrain_02_diff_4k.jpg'));

  //Passen Sie den Farbraum an, um lebendigere Farben zu erzielen
  planetTexture.colorSpace = THREE.SRGBColorSpace;
  planetTexture.magFilter = THREE.NearestFilter;
  planetTexture.minFilter = THREE.NearestFilter;

  //Stern
  const starsGeo = new THREE.BufferGeometry();
  const count = 1200;
  const position = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++){
    position[i] = (Math.random() - 0.5) * 250;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(position, 3));
  const starsMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.8});
  scene.add(new THREE.Points(starsGeo, starsMat));

  //Kugel
  const planetGeo = new THREE.SphereGeometry(PLANET_RADIUS, 64, 64);
  const planetMat = new THREE.MeshBasicMaterial({map: planetTexture, wireframe: false, reflectivity: 0.2}) //Roughness here?
  const planet = new THREE.Mesh(planetGeo, planetMat);
  scene.add(planet);
  
  const houseDirections = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle),
      0.35,
      Math.sin(angle)
    );
  });

  const triggers: HouseTrigger[] = [];

  houseDirections.forEach((dir, index) => {
    const houseContent: HouseContent = {
      name: `House ${index + 1}`,
      interiorColor: [0xff5555, 0xff9955, 0xffdd55, 0x88cc66, 0x44bb99,
        0x55aadd, 0x7777dd, 0xaa66cc, 0xdd66aa, 0xcc8866][index],
      url: 'https://github.com',
    };
    const house = new House({
      id: `house-${index}`,
      direction: dir,
      planetRadius: PLANET_RADIUS,
      content: houseContent,
    }, collisionSystem);
    scene.add(house.mesh);

    triggers.push({
      position: house.triggerPosition,
      promptPosition: house.promptPosition,
      type: 'ENTER',
      houseContent: house.content,
    });
  });

  const platformDirections = [
    new THREE.Vector3(0.18, 0.95, 0.18),
    new THREE.Vector3(0.28, 0.89, 0.36),
    new THREE.Vector3(0.4, 0.8, 0.5),
    new THREE.Vector3(0.55, 0.68, 0.62),
    new THREE.Vector3(0.7, 0.52, 0.58),
    new THREE.Vector3(0.8, 0.38, 0.48),
  ];

  platformDirections.forEach((direction, index) => {
    const platform = new Platform({
      id: `platform-${index}`,
      direction,
      planetRadius: PLANET_RADIUS,
      width: 3.2,
      depth: 3.2,
      height: 1.2,
      thickness: 0.35,
      color: 0x996633,
    }, collisionSystem);
    scene.add(platform.mesh);
  });

  // housePositions.forEach((pos) => {
  //   // Estructura de la Casa 
  //   const houseGeo = new THREE.BoxGeometry(3, 3, 3);
  //   const houseMat = new THREE.MeshStandardMaterial({ color: 0xaa4444 });
  //   const house = new THREE.Mesh(houseGeo, houseMat);
  //   house.position.set(pos.x, 1.5, pos.z);
  //   scene.add(house);

  //   // Doa
  //   const doorGeo = new THREE.BoxGeometry(0.8, 1.6, 0.1);
  //   const doorMat = new THREE.MeshStandardMaterial({ color: 0x442211 });
  //   const door = new THREE.Mesh(doorGeo, doorMat);
  //   door.position.set(pos.x, 0.8, pos.z + 1.5);
  //   scene.add(door);

  //   // Activation Point
  //   triggers.push({
  //     position: new THREE.Vector3(pos.x, 0.5, pos.z + 2.2),
  //     promptPosition: new THREE.Vector3(pos.x, 2.5, pos.z + 1.5),
  //     type: 'ENTER',
  //   });
  // });

  const npcConfigs = [
    {
      id: 'old-guy',
      direction: new THREE.Vector3(0.05, 0.98, 0.05),
      name: 'Old guy',
      lines: [
        'Hello! I make games using a toaster',
        'You can see around what I had made',
        'Interact using E',
      ],
    },
    {
      id: 'platform-guide',
      direction: new THREE.Vector3(0.78, 0.42, 0.45),
      name: 'Platform guide',
      lines: [
        'The platforms follow the curve of the planet.',
        'Hold Space to jump higher and reach the next one.',
        'Try not to fall.',
      ],
    },
  ];

  const npcData = npcConfigs.map((config) => {
    const npc = new NPC({
      ...config,
      planetRadius: PLANET_RADIUS,
    }, collisionSystem);
    scene.add(npc.mesh);
    return npc.data;
  });

  return {triggers, npcData};
}

// Inside
export interface InteriorSceneData {
  triggers: HouseTrigger[];
  bounds: FlatBounds;
}

export function setupInteriorScene(scene: THREE.Scene, houseContent?: HouseContent): InteriorSceneData {
  // Suelo de madera
  const floorGeo = new THREE.PlaneGeometry(8, 8);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x553311, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  const interiorObject = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({
      color: houseContent?.interiorColor ?? 0x00ff88,
    })
  );
  interiorObject.position.set(0, 0.6, 0);
  interiorObject.userData.houseContent = houseContent;
  scene.add(interiorObject);

  // Paredes de cajas
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x888899 });

  const createWall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    wall.position.set(x, y, z);
    scene.add(wall);
  };

  createWall(8, 3, 0.2, 0, 1.5, -4); // Pared Trasera
  createWall(0.2, 3, 8, -4, 1.5, 0); // Pared Izquierda
  createWall(0.2, 3, 8, 4, 1.5, 0);  // Pared Derecha

  // The walls occupy the outer 0.1 units of the room. Leave space for the
  // player's collision radius inside those inner faces.
  return {
    triggers: [
      {
        position: new THREE.Vector3(0, 0.5, 3),
        promptPosition: new THREE.Vector3(0, 2, 3.5),
        type: 'EXIT',
      },
      ...(houseContent ? [{
        position: new THREE.Vector3(0, 0.5, 0),
        promptPosition: new THREE.Vector3(0, 2, 0),
        type: 'LINK' as const,
        houseContent,
      }] : []),
    ],
    bounds: {
      minX: -4,
      maxX: 4,
      minZ: -4,
      maxZ: 4,
    },
  };
}

export function setupMenuScene(scene: THREE.Scene) {
  // Floor
  const grid = new THREE.GridHelper(20, 20, 0x00ff88, 0x444444);
  scene.add(grid);

  // Cubo
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
  const menuCube = new THREE.Mesh(geometry, material);
  menuCube.position.set(0, 1.2, 0);
  scene.add(menuCube);

  return menuCube;
}