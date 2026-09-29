import * as THREE from 'three';
import { publicAssetUrl } from '../../assets';
import { NPC } from '../../entities/NPC';
import { Platform } from '../../entities/Platform';
import type { WorldBuildResult, WorldDefinition } from '../types';
import {
  dialogueHologramConfigs,
  npcConfigs,
  pathPlatformConfig,
  planetConfig,
  projectDirections,
  projects,
  southPoleLiftConfig,
  southPoleLiftNpcConfig,
} from './config';

const projectFigureHeight = 0.8;
const projectFigureGeometries = [
  () => new THREE.BoxGeometry(1, 1, 1),
  () => new THREE.OctahedronGeometry(0.7),
  () => new THREE.DodecahedronGeometry(0.7),
  () => new THREE.IcosahedronGeometry(0.7),
];

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

function createProjectFigure(
  scene: THREE.Scene,
  direction: THREE.Vector3,
  index: number
): THREE.Sprite {
  const normal = direction.clone().normalize();
  const figure = new THREE.Mesh(
    projectFigureGeometries[index % projectFigureGeometries.length](),
    new THREE.MeshStandardMaterial({
      color: projects[index].interiorColor,
      roughness: 0.45,
      metalness: 0.15,
    })
  );
  figure.position.copy(normal).multiplyScalar(planetConfig.radius + projectFigureHeight);
  figure.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  figure.rotateY(index * Math.PI / 6);
  scene.add(figure);

  const projectionMaterial = new THREE.SpriteMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const projection = new THREE.Sprite(projectionMaterial);
  projection.layers.set(1);
  projection.scale.set(2, 1.25, 1);
  projection.position.copy(normal)
    .multiplyScalar(planetConfig.radius + projectFigureHeight + 2.1);
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

function createDialogueProjection(
  scene: THREE.Scene,
  direction: THREE.Vector3,
  imageUrl: string
): THREE.Sprite {
  const projectionMaterial = new THREE.SpriteMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const projection = new THREE.Sprite(projectionMaterial);
  projection.layers.set(1);
  projection.scale.set(2, 1.25, 1);
  projection.position.copy(direction.clone().normalize())
    .multiplyScalar(planetConfig.radius + 2.4);
  projection.visible = false;
  scene.add(projection);

  new THREE.TextureLoader().load(
    publicAssetUrl(imageUrl),
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
      const projection = createProjectFigure(scene, direction, index);
      const normal = direction.clone().normalize();
      triggers.push({
        position: normal.clone().multiplyScalar(planetConfig.radius + projectFigureHeight + 0.5),
        promptPosition: normal.clone().multiplyScalar(planetConfig.radius + projectFigureHeight + 2.7),
        type: 'ENTER',
        houseContent: projects[index],
        projection,
      });
    });

    const platforms: Platform[] = [];
    pathPlatformConfig.forEach((config) => {
      const platform = new Platform({
        ...config,
        planetRadius: planetConfig.radius,
      }, collisionSystem);
      scene.add(platform.mesh);
      platforms.push(platform);
    });
    const southPoleLift = new Platform({
      ...southPoleLiftConfig,
      planetRadius: planetConfig.radius,
    }, collisionSystem);
    scene.add(southPoleLift.mesh);
    let southPoleLiftStarted = false;

    const npcData = npcConfigs.map((config) => {
      const npc = new NPC({ ...config, planetRadius: planetConfig.radius }, collisionSystem);
      scene.add(npc.mesh);
      return npc.data;
    });
    const southPoleLiftNpc = new NPC({
      ...southPoleLiftNpcConfig,
      planetRadius: planetConfig.radius,
    }, collisionSystem);
    scene.add(southPoleLiftNpc.mesh);
    npcData.push(southPoleLiftNpc.data);
    const dialogueHologramData = dialogueHologramConfigs.map((config, index) => {
      const npc = new NPC({ ...config, planetRadius: planetConfig.radius }, collisionSystem);
      scene.add(npc.mesh);
      return {
        ...npc.data,
        projection: createDialogueProjection(scene, config.direction, projects[index].imageUrl),
      };
    });

    return {
      triggers,
      npcData: [...npcData, ...dialogueHologramData],
      update(playerPosition, delta, playerIsGrounded, playerCollisionRadius) {
        pathPlatformConfig.forEach((config, index) => {
          const distance = playerPosition.distanceTo(npcData[index].position);
          const proximity = 1 - THREE.MathUtils.clamp((distance - 1.8) / 3.2, 0, 1);
          const easedProximity = proximity * proximity * (3 - 2 * proximity);
          const initialHeight = config.height ?? 1;
          const targetHeight = THREE.MathUtils.lerp(initialHeight, 0.5, easedProximity);
          const height = THREE.MathUtils.damp(
            platforms[index].collider.height,
            targetHeight,
            5,
            delta
          );

          platforms[index].setHeight(height);
          npcData[index].position.copy(config.direction).normalize()
            .multiplyScalar(planetConfig.radius + height + 0.5);
        });

        const liftCollider = southPoleLift.collider;
        const playerNormal = playerPosition.clone().normalize();
        const liftOffset = playerNormal.clone().sub(liftCollider.normal)
          .multiplyScalar(planetConfig.radius);
        const liftLocalX = liftOffset.dot(liftCollider.right);
        const liftLocalZ = liftOffset.dot(liftCollider.forward);
        const isOverLift = playerNormal.dot(liftCollider.normal) > 0
          && Math.abs(liftLocalX) <= liftCollider.width / 2 + playerCollisionRadius
          && Math.abs(liftLocalZ) <= liftCollider.depth / 2 + playerCollisionRadius;
        const playerHeight = playerPosition.length() - planetConfig.radius - 0.5;
        const isStandingOnLift = playerIsGrounded
          && isOverLift
          && Math.abs(playerHeight - liftCollider.height) <= 0.08;

        if (isStandingOnLift) southPoleLiftStarted = true;
        if (southPoleLiftStarted) {
          const initialHeight = southPoleLiftConfig.height ?? 0.6;
          const targetHeight = isOverLift ? initialHeight + 42 : initialHeight;
          const heightChange = delta * 12;
          const nextHeight = targetHeight > liftCollider.height
            ? Math.min(liftCollider.height + heightChange, targetHeight)
            : Math.max(liftCollider.height - heightChange, targetHeight);
          southPoleLift.setHeight(nextHeight);
        }
      },
    };
  },
};