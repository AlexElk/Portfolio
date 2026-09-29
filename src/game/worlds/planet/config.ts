import * as THREE from 'three';
import type { HouseContent } from '../../entities/House';
import type { NPCConfig } from '../../entities/NPC';
import type { PlatformConfig } from '../../entities/Platform';

export const planetConfig = {
  radius: 10,
  backgroundColor: 0x020208,
  textureUrl: '/textures/rocky_terrain_02_diff_4k.jpg',
  starCount: 1200,
  starSpread: 250,
};

const projectColors = [
  0xff5555, 0xff9955, 0xffdd55, 0x88cc66, 0x44bb99,
  0x55aadd, 0x7777dd, 0xaa66cc, 0xdd66aa, 0xcc8866,
];

export const projects: HouseContent[] = projectColors.map((interiorColor, index) => ({
  name: `Project ${index + 1}`,
  interiorColor,
  url: 'https://github.com',
  imageUrl: `/images/projections/project-${String(index + 1).padStart(2, '0')}.jpg`,
}));

export const projectDirections = projects.map((_, index) => {
  const angle = (index / projects.length) * Math.PI * 2;
  return new THREE.Vector3(Math.cos(angle), 0.35, Math.sin(angle));
});

export const projectPlatformConfig = {
  width: 2.2,
  depth: 2.2,
  height: 1.2,
  thickness: 0.3,
  color: 0x287b83,
};

export const pathPlatformConfig: PlatformConfig[] = [
  new THREE.Vector3(0.18, 0.95, 0.18),
  new THREE.Vector3(0.28, 0.89, 0.36),
  new THREE.Vector3(0.4, 0.8, 0.5),
  new THREE.Vector3(0.55, 0.68, 0.62),
  new THREE.Vector3(0.7, 0.52, 0.58),
  new THREE.Vector3(0.8, 0.38, 0.48),
].map((direction, index) => ({
  id: `platform-${index}`,
  direction,
  width: 3.2,
  depth: 3.2,
  height: 1.2,
  thickness: 0.35,
  color: 0x996633,
}));

export const npcConfigs: Omit<NPCConfig, 'planetRadius'>[] = [
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