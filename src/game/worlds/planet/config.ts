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
      'Brown platforms spiral up from the south pole.',
      'Hold Space while jumping to reach the next platform.',
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

const pathPlatformCount = 12;
const pathPlatformCenterSeparation = 5.2;
const pathPlatformStartHeight = 1.2;
const pathPlatformHeightSpan = 2.64;
const pathPlatformVerticalSpan = 7.15;
const pathPlatformStartY = -(planetConfig.radius + pathPlatformStartHeight) * 0.94;
let previousHorizontalRadius = 0;
let pathAngle = 0;

export const pathPlatformConfig: PlatformConfig[] = Array.from(
  { length: pathPlatformCount },
  (_, index) => {
    const progress = index / (pathPlatformCount - 1);
    const height = pathPlatformStartHeight + progress * pathPlatformHeightSpan;
    const radius = planetConfig.radius + height;
    const centerY = pathPlatformStartY + progress * pathPlatformVerticalSpan;
    const horizontalRadius = Math.sqrt(radius ** 2 - centerY ** 2);

    if (index > 0) {
      const verticalStep = pathPlatformVerticalSpan / (pathPlatformCount - 1);
      const horizontalSeparation = Math.sqrt(
        pathPlatformCenterSeparation ** 2 - verticalStep ** 2
      );
      const angleCosine = (
        previousHorizontalRadius ** 2 + horizontalRadius ** 2 - horizontalSeparation ** 2
      ) / (2 * previousHorizontalRadius * horizontalRadius);
      pathAngle += Math.acos(THREE.MathUtils.clamp(angleCosine, -1, 1));
    }

    previousHorizontalRadius = horizontalRadius;
    const direction = new THREE.Vector3(
      Math.cos(pathAngle) * horizontalRadius,
      centerY,
      Math.sin(pathAngle) * horizontalRadius
    ).normalize();

    return {
      id: `platform-${index}`,
      direction,
      width: 2.4,
      depth: 2.4,
      height,
      thickness: 0.35,
      color: 0x996633,
    };
  }
);

const lastPathPlatform = pathPlatformConfig[pathPlatformConfig.length - 1];
const lastPathPlatformHeight = lastPathPlatform.height ?? 1;

export const npcConfigs: Omit<NPCConfig, 'planetRadius'>[] = [
  {
    id: 'platform-guide',
    direction: lastPathPlatform.direction,
    heightOffset: lastPathPlatformHeight + 0.5,
    name: 'Platform guide',
    lines: [
      'The platforms follow the curve of the planet.',
      'Hold Space to jump higher and reach the next one.',
      'Try not to fall.',
    ],
  },
];