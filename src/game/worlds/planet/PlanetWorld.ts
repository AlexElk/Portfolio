import * as THREE from 'three';
import { publicAssetUrl } from '../../assets';
import type { CollisionSystem } from '../../CollisionSystem';
import { NPC } from '../../entities/NPC';
import { Platform } from '../../entities/Platform';
import type { WorldBuildResult, WorldDefinition } from '../types';
import {
  npcConfigs,
  pathPlatformConfig,
  planetConfig,
  projectDirections,
  projectPlatformConfig,
  projects,
} from './config';

function createStars(scene: THREE.Scene): void {
  const positions = new Float32Array(planetConfig.starCount * 3);
  for (let index = 0; index < positions.length; index++) {
    positions[index] = (Math.random() - 0.5) * planetConfig.starSpread;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 })
  ));
}

function createPlanet(scene: THREE.Scene): void {
  const texture = new THREE.TextureLoader().load(publicAssetUrl(planetConfig.textureUrl));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(planetConfig.radius, 64, 64),
    new THREE.MeshBasicMaterial({ map: texture, wireframe: false, reflectivity: 0.2 })
  );
  scene.add(planet);
}

function createProjectPlatform(
  scene: THREE.Scene,
  collisionSystem: CollisionSystem,
  direction: THREE.Vector3,
  index: number
): THREE.Sprite {
  const platform = new Platform({
    id: `project-platform-${index}`,
    direction,
    planetRadius: planetConfig.radius,
    ...projectPlatformConfig,
  }, collisionSystem);
  scene.add(platform.mesh);

  const projectionMaterial = new THREE.SpriteMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const projection = new THREE.Sprite(projectionMaterial);
  projection.scale.set(2, 1.25, 1);
  projection.position.copy(direction.clone().normalize())
    .multiplyScalar(planetConfig.radius + projectPlatformConfig.height + 2.1);
  projection.visible = false;
  scene.add(projection);

  new THREE.TextureLoader().load(
    publicAssetUrl(projects[index].imageUrl),
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      projectionMaterial.map = texture;
      projectionMaterial.needsUpdate = true;
    },
    undefined,
    () => {
      projectionMaterial.color.set(0x00e5ff);
      projectionMaterial.needsUpdate = true;
    }
  );

  return projection;
}

export const planetWorld: WorldDefinition = {
  id: 'OVERWORLD',
  build({ scene, collisionSystem }): WorldBuildResult {
    scene.background = new THREE.Color(planetConfig.backgroundColor);
    createStars(scene);
    createPlanet(scene);

    const triggers: WorldBuildResult['triggers'] = [];
    projectDirections.forEach((direction, index) => {
      const projection = createProjectPlatform(scene, collisionSystem, direction, index);
      const platformHeight = projectPlatformConfig.height;
      const normal = direction.clone().normalize();
      triggers.push({
        position: normal.clone().multiplyScalar(planetConfig.radius + platformHeight + 0.5),
        promptPosition: normal.clone().multiplyScalar(planetConfig.radius + platformHeight + 2.7),
        type: 'ENTER',
        houseContent: projects[index],
        projection,
      });
    });

    pathPlatformConfig.forEach((config) => {
      const platform = new Platform({
        ...config,
        planetRadius: planetConfig.radius,
      }, collisionSystem);
      scene.add(platform.mesh);
    });

    const npcData = npcConfigs.map((config) => {
      const npc = new NPC({ ...config, planetRadius: planetConfig.radius }, collisionSystem);
      scene.add(npc.mesh);
      return npc.data;
    });

    return { triggers, npcData };
  },
};