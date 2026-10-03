import * as THREE from 'three';

export interface DissolveEffect {
  points: THREE.Points;
  positionAttribute: THREE.BufferAttribute;
  initialPositions: Float32Array;
  spiralDirections: Float32Array;
  spiralBasisA: Float32Array;
  spiralBasisB: Float32Array;
  spiralPhases: Float32Array;
  spiralSpeeds: Float32Array;
  travelSpeeds: Float32Array;
  elapsed: number;
  duration: number;
}

export function createDissolveEffectForObject(
  scene: THREE.Scene,
  object: THREE.Object3D,
  duration = 1.2
): DissolveEffect | null {
  object.updateMatrixWorld(true);

  const sourceMeshes: THREE.Mesh[] = [];
  let totalVertexCount = 0;

  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    const positions = mesh.geometry?.getAttribute('position');
    if (!mesh.isMesh || !positions) return;

    sourceMeshes.push(mesh);
    totalVertexCount += positions.count;
  });

  if (totalVertexCount === 0) return null;

  const vertexStep = Math.max(1, Math.ceil(totalVertexCount / 900));
  const particlePositions: number[] = [];
  const spiralDirections: number[] = [];
  const spiralBasisA: number[] = [];
  const spiralBasisB: number[] = [];
  const spiralPhases: number[] = [];
  const spiralSpeeds: number[] = [];
  const travelSpeeds: number[] = [];
  const objectCenter = object.getWorldPosition(new THREE.Vector3());

  sourceMeshes.forEach((mesh) => {
    const vertexCount = mesh.geometry.getAttribute('position').count;
    const vertex = new THREE.Vector3();

    for (let index = 0; index < vertexCount; index += vertexStep) {
      mesh.getVertexPosition(index, vertex);
      mesh.localToWorld(vertex);
      particlePositions.push(vertex.x, vertex.y, vertex.z);

      const outward = vertex.clone().sub(objectCenter).normalize();
      const randomDirection = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      const spiralDirection = outward.multiplyScalar(0.65)
        .addScaledVector(randomDirection, 0.85)
        .normalize();
      const referenceAxis = Math.abs(spiralDirection.y) < 0.9
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);

      const basisA = new THREE.Vector3()
        .crossVectors(spiralDirection, referenceAxis)
        .normalize();
      const basisB = new THREE.Vector3()
        .crossVectors(spiralDirection, basisA)
        .normalize();

      spiralDirections.push(spiralDirection.x, spiralDirection.y, spiralDirection.z);
      spiralBasisA.push(basisA.x, basisA.y, basisA.z);
      spiralBasisB.push(basisB.x, basisB.y, basisB.z);
      spiralPhases.push(Math.random() * Math.PI * 2);
      spiralSpeeds.push(12 + Math.random() * 10);
      travelSpeeds.push(0.5 + Math.random() * 0.9);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xb8f4ff,
    size: 0.13,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  return {
    points,
    positionAttribute: geometry.getAttribute('position') as THREE.BufferAttribute,
    initialPositions: new Float32Array(particlePositions),
    spiralDirections: new Float32Array(spiralDirections),
    spiralBasisA: new Float32Array(spiralBasisA),
    spiralBasisB: new Float32Array(spiralBasisB),
    spiralPhases: new Float32Array(spiralPhases),
    spiralSpeeds: new Float32Array(spiralSpeeds),
    travelSpeeds: new Float32Array(travelSpeeds),
    elapsed: 0,
    duration,
  };
}

export function updateDissolveEffect(effect: DissolveEffect, delta: number): number {
  effect.elapsed += delta;
  const progress = Math.min(effect.elapsed / effect.duration, 1);
  const positionArray = effect.positionAttribute.array as Float32Array;
  const particleCount = effect.spiralPhases.length;

  for (let particle = 0; particle < particleCount; particle += 1) {
    const offset = particle * 3;
    const phase = effect.spiralPhases[particle];
    const angle = phase + effect.spiralSpeeds[particle] * effect.elapsed;
    const spiralRadius = 0.15 + progress * 1.25;
    const radialA = spiralRadius * (Math.cos(angle) - Math.cos(phase));
    const radialB = spiralRadius * (Math.sin(angle) - Math.sin(phase));
    const travel = effect.travelSpeeds[particle] * effect.elapsed;

    for (let axis = 0; axis < 3; axis += 1) {
      positionArray[offset + axis] = effect.initialPositions[offset + axis]
        + effect.spiralDirections[offset + axis] * travel
        + effect.spiralBasisA[offset + axis] * radialA
        + effect.spiralBasisB[offset + axis] * radialB;
    }
  }

  effect.positionAttribute.needsUpdate = true;
  (effect.points.material as THREE.PointsMaterial).opacity = 1 - progress;
  effect.points.scale.setScalar(1 + progress * 0.35);

  return progress;
}

export function disposeDissolveEffect(effect: DissolveEffect, scene: THREE.Scene): void {
  scene.remove(effect.points);
  effect.points.geometry.dispose();
  (effect.points.material as THREE.Material).dispose();
}
