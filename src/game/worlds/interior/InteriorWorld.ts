import * as THREE from 'three';
import { publicAssetUrl } from '../../assets';
import { NPC } from '../../entities/NPC';
import { interiorConfig } from './config';
import type { WorldDefinition } from '../types';

function createProjectProjection(scene: THREE.Scene, direction: THREE.Vector3, imageUrl: string): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const projection = new THREE.Sprite(material);
  projection.layers.set(1);
  projection.scale.set(2, 1.25, 1);
  projection.position.copy(direction.clone().normalize())
    .multiplyScalar(interiorConfig.planetRadius + 0.9);
  projection.visible = true;
  scene.add(projection);

  new THREE.TextureLoader().load(
    publicAssetUrl(imageUrl),
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      material.map = texture;
      material.needsUpdate = true;
    },
    undefined,
    () => {
      material.color.set(0x00e5ff);
      material.needsUpdate = true;
    }
  );

  return projection;
}

function createExitPlatform(scene: THREE.Scene, direction: THREE.Vector3): THREE.Mesh {
  const normal = direction.clone().normalize();
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 0.18, 24),
    new THREE.MeshStandardMaterial({
      color: 0x7be5ff,
      emissive: 0x0d2a3a,
      metalness: 0.25,
      roughness: 0.5,
    })
  );
  platform.position.copy(normal).multiplyScalar(interiorConfig.planetRadius + 0.18);
  platform.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  scene.add(platform);
  return platform;
}

function createLinkObject(scene: THREE.Scene, direction: THREE.Vector3, color: number): THREE.Mesh {
  const normal = direction.clone().normalize();
  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.9, 0.9),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.2,
      roughness: 0.7,
      metalness: 0.1,
    })
  );
  marker.position.copy(normal).multiplyScalar(interiorConfig.planetRadius + 0.22);
  marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  scene.add(marker);
  return marker;
}

export const interiorWorld: WorldDefinition = {
  id: 'INTERIOR',
  build({ scene, collisionSystem }, options) {
    const projectColor = options?.houseContent?.interiorColor ?? interiorConfig.defaultObjectColor;
    const projectImageUrl = options?.houseContent?.imageUrl ?? '/images/projections/repository-01.png';
    const planetRadius = interiorConfig.planetRadius;

    scene.background = new THREE.Color(0x020208);

    const starPositions = new Float32Array(600 * 3);
    for (let index = 0; index < starPositions.length; index += 3) {
      starPositions[index] = (Math.random() - 0.5) * 28;
      starPositions[index + 1] = (Math.random() - 0.5) * 18;
      starPositions[index + 2] = (Math.random() - 0.5) * 28;
    }

    const stars = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 })
    );
    stars.geometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(stars);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius, 48, 48),
      new THREE.MeshStandardMaterial({
        color: projectColor,
        roughness: 0.8,
        metalness: 0.15,
      })
    );
    scene.add(planet);

    const exitDirection = new THREE.Vector3(0, 1, 0).normalize();
    const projectDirection = new THREE.Vector3(0.8, 0.25, 0.6).normalize();
    const npcDirection = new THREE.Vector3(-0.75, 0.4, -0.5).normalize();

    const exitPlatform = createExitPlatform(scene, exitDirection);
    const projectMarker = createLinkObject(scene, projectDirection, projectColor);
    const npc = new NPC({
      id: 'project-guide',
      name: options?.houseContent?.name ?? 'Project Guide',
      lines: [
        'This is my project world.',
        'The mini planet keeps the same flow, but in a smaller scale.',
      ],
      direction: npcDirection,
      planetRadius,
      heightOffset: 0.18,
      size: 0.8,
      color: projectColor,
    }, collisionSystem);
    scene.add(npc.mesh);

    const npcProjection = createProjectProjection(scene, npcDirection, projectImageUrl);

    return {
      triggers: [
        {
          position: exitPlatform.position.clone(),
          promptPosition: exitDirection.clone().multiplyScalar(planetRadius + 2.2),
          type: 'EXIT',
        },
        ...(options?.houseContent ? [{
          position: projectMarker.position.clone(),
          promptPosition: projectDirection.clone().multiplyScalar(planetRadius + 2.5),
          type: 'LINK' as const,
          houseContent: options.houseContent,
        }] : []),
      ],
      npcData: [{
        ...npc.data,
        projection: npcProjection,
      }],
      player: {
        spawnPosition: new THREE.Vector3(0, 1, 0).normalize().multiplyScalar(planetRadius + 0.5),
        planetRadius,
      },
    };
  },
};