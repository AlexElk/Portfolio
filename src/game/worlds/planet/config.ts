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

const cardinalAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

export const projectDirections = cardinalAngles.flatMap((angle) =>
  [-1, 1].map((side) => {
    const projectAngle = angle + side * Math.PI / 12;
    return new THREE.Vector3(Math.cos(projectAngle), 0, Math.sin(projectAngle));
  })
);

const dialogueHologramContent = [
  {
    name: 'Welcome',
    lines: [
      'Welcome to my portfolio.',
      'The teal holograms along the equator open my projects.',
    ],
  },
  {
    name: 'Explore',
    lines: [
      'There are more projects around the planet.',
      'Follow the equator to find the other holograms.',
    ],
  },
  {
    name: 'Platforming',
    lines: [
      'Three brown platforms sit halfway between the south pole and equator.',
      'Hold Space while jumping to reach them.',
    ],
  },
  {
    name: 'Projects',
    lines: [
      'Each teal platform leads to a project space.',
      'Press E near a hologram to open it.',
    ],
  },
];

export const dialogueHologramConfigs: Omit<NPCConfig, 'planetRadius'>[] =
  cardinalAngles.map((angle, index) => {
    const latitude = Math.PI / 4;
    const horizontalRadius = Math.cos(latitude);
    return {
      id: `dialogue-hologram-${index}`,
      direction: new THREE.Vector3(
        Math.cos(angle) * horizontalRadius,
        Math.sin(latitude),
        Math.sin(angle) * horizontalRadius
      ),
      ...dialogueHologramContent[index],
      size: 0.7,
      color: 0x55eaff,
    };
  });

export const projectPlatformConfig = {
  width: 2.2,
  depth: 2.2,
  height: 1.2,
  thickness: 0.3,
  color: 0x287b83,
};

const pathPlatformCount = 3;
const pathPlatformLatitude = -Math.PI / 4;
const pathPlatformHeight = 4;

export const pathPlatformConfig: PlatformConfig[] = Array.from(
  { length: pathPlatformCount },
  (_, index) => {
    const angle = (index / pathPlatformCount) * Math.PI * 2;
    const horizontalRadius = Math.cos(pathPlatformLatitude);
    const direction = new THREE.Vector3(
      Math.cos(angle) * horizontalRadius,
      Math.sin(pathPlatformLatitude),
      Math.sin(angle) * horizontalRadius
    );

    return {
      id: `platform-${index}`,
      direction,
      width: 2.4,
      depth: 2.4,
      height: pathPlatformHeight,
      thickness: 0.35,
      color: 0x996633,
    };
  }
);

export const southPoleLiftConfig: PlatformConfig = {
  id: 'south-pole-lift',
  direction: new THREE.Vector3(0, -1, 0),
  width: 3.2,
  depth: 3.2,
  collisionWidth: 1.4,
  collisionDepth: 1.4,
  collisionHeightScale: 0.4,
  height: 0.6,
  thickness: 0.45,
  color: 0xb58146,
};

export const southPoleLiftNpcConfig: Omit<NPCConfig, 'planetRadius'> = {
  id: 'south-pole-lift-guide',
  name: 'The Lookout',
  lines: [
    'You made it all the way to the southern pole.',
    'The lift can carry you back down whenever you are ready.',
  ],
  direction: new THREE.Vector3(0.05, -1, 0),
  heightOffset: (southPoleLiftConfig.height ?? 0.6) + 42 + 0.5,
  size: 0.8,
  color: 0x55eaff,
};

const platformGuides = [
  {
    name: 'The Ascent',
    lines: [
      'These platforms trace a route up from the southern hemisphere.',
      'Hold Space while jumping to gain enough height for the next one.',
    ],
  },
  {
    name: 'The Navigator',
    lines: [
      'The next platform is farther around the planet than it looks.',
      'Keep moving along the curve and use the horizon to line up your jump.',
    ],
  },
  {
    name: 'The Safety Check',
    lines: [
      'Miss a landing and you will fall back onto the planet.',
      'Take your time; the platforms are spaced to be reached one at a time.',
    ],
  },
];

export const npcConfigs: Omit<NPCConfig, 'planetRadius'>[] = pathPlatformConfig.map(
  (platform, index) => ({
    id: `platform-guide-${index}`,
    direction: platform.direction,
    heightOffset: (platform.height ?? 1) + 0.5,
    ...platformGuides[index],
  })
);