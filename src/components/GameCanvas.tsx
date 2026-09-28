// src/components/GameCanvas.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createScene } from '../game/SceneSetUp';
import { InputHandler } from '../game/InputHandler';
import { Player } from '../game/Player';
import { CameraController } from '../game/CameraController';
import { CollisionSystem } from '../game/CollisionSystem';
import { FlatCollisionSystem } from '../game/FlatCollisionSystem';
import { setupOverworldScene, setupInteriorScene, HouseTrigger, NPCData, HouseContent } from '../game/Scenes';
import TouchControls from './TouchControls';
import MenuOverlay from './MenuOverlay';
import InteractionPrompt from './InteractionPrompt';
import DialogueBox from './DialogueBox';

type SceneState = 'MENU' | 'OVERWORLD' | 'INTERIOR';

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estados del juego
  const [sceneState, setSceneState] = useState<SceneState>('MENU');
  const [inputHandler, setInputHandler] = useState<InputHandler | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null); //* I might delete this
  const cameraControllerRef = useRef<CameraController | null>(null);

  const [activeDialogue, setActiveDialogue] = useState<{
    name: string;
    lines: string[];
  } | null>(null);

  // Estado para el prompt flotante
  const [promptData, setPromptData] = useState<{
    visible: boolean;
    position: THREE.Vector3 | null;
    text: string;
  }>({ visible: false, position: null, text: '' });

  const activeTriggerRef = useRef<HouseTrigger | null>(null);
  const activeNpcRef = useRef<NPCData | null>(null);
  const activeHouseContentRef = useRef<HouseContent | null>(null);
  const isDialogueActiveRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera: mainCam, renderer, cleanup: cleanupScene } = createScene(containerRef.current);
    const input = new InputHandler();
    const collisionSystem = new CollisionSystem();
    const player = new Player(collisionSystem);
    const cameraController = new CameraController(mainCam, containerRef.current);
    const clock = new THREE.Timer();

    cameraControllerRef.current = cameraController;

    setCamera(mainCam);
    setInputHandler(input);

    let triggers: HouseTrigger[] = [];
    let npcData: NPCData[] = [];

    // Cargar elementos 3D según el estado actual
    if (sceneState === 'OVERWORLD') {
      scene.add(player.mesh);
      const res = setupOverworldScene(scene, collisionSystem);
      triggers = res.triggers;
      npcData = res.npcData;
    } else if (sceneState === 'INTERIOR') {
      player.mesh.position.set(0, 0.5, 2); // Posición de entrada
      const interior = setupInteriorScene(scene, activeHouseContentRef.current ?? undefined);
      player.setFlatMovement(new FlatCollisionSystem(interior.bounds));
      cameraController.setMode('FLAT');
      cameraController.setFlatView(
        new THREE.Vector3(0, 5.5, 8),
        new THREE.Vector3(0, 0.8, 0)
      );
      scene.add(player.mesh);
      triggers = interior.triggers;
    }

    // Sobrescribir la acción de la tecla E
    input.setActionHandler(() => {
        if (isDialogueActiveRef.current) return;

        if (activeNpcRef.current) {
            isDialogueActiveRef.current = true;
            cameraController.startDialogueMode(player.mesh.position, activeNpcRef.current.position);
            setActiveDialogue({
                name: activeNpcRef.current.name,
                lines: activeNpcRef.current.lines,
            });
            return;
        }

      if (activeTriggerRef.current) {
        if (activeTriggerRef.current.type === 'ENTER') {
          activeHouseContentRef.current = activeTriggerRef.current.houseContent ?? null;
          setSceneState('INTERIOR');
        } else if (activeTriggerRef.current.type === 'LINK') {
          const url = activeTriggerRef.current.houseContent?.url;
          if (url) window.open(url, '_blank', 'noopener,noreferrer');
        } else if (activeTriggerRef.current.type === 'EXIT') {
          setSceneState('OVERWORLD');
        }
      }
    });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      clock.update();
      const delta = clock.getDelta();

      if (sceneState !== 'MENU') {

        if (!isDialogueActiveRef.current) {
          player.update(input, cameraController.yaw, mainCam, delta);
        } else {
          player.update(null, cameraController.yaw, mainCam, delta);
        }
        cameraController.update(player.mesh.position);

        let closestNpc: NPCData | null = null;
        let closestNpcDistance = 1.8;
        for (const candidate of npcData) {
          const distanceToNpc = player.mesh.position.distanceTo(candidate.position);
          if (distanceToNpc < closestNpcDistance) {
            closestNpc = candidate;
            closestNpcDistance = distanceToNpc;
          }
        }
        activeNpcRef.current = closestNpc;

        // Detectar cercanía con zonas de interacción
        let nearTrigger: HouseTrigger | null = null;
        for (const trigger of triggers) {
          const dist = player.mesh.position.distanceTo(trigger.position);
          if (dist < 1.5) {
            nearTrigger = trigger;
            break;
          }
        }

        activeTriggerRef.current = nearTrigger;

        if (isDialogueActiveRef.current) {
          // Hide
          setPromptData((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        } else if (activeNpcRef.current) {
          // If npc near show it
          const npcPromptPos = activeNpcRef.current.position.clone().add(new THREE.Vector3(0, 1.2, 0));
          setPromptData({
            visible: true,
            position: npcPromptPos,
            text: '',
          });
        } else if (nearTrigger) {
          // near door
          setPromptData({
            visible: true,
            position: nearTrigger.promptPosition,
            text: '',
          });
        } else {
          // hide otherwise
          setPromptData((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        }
      }


      renderer.render(scene, mainCam);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      input.destroy();
      cleanupScene();
    };
  }, [sceneState]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />

      {/* Menú Principal */}
      {sceneState === 'MENU' && (
        <MenuOverlay onStart={() => setSceneState('OVERWORLD')} />
      )}

      {/* Texto Flotante Reutilizable */}
      <InteractionPrompt
        visible={promptData.visible && sceneState !== 'MENU'}
        position={promptData.position}
        camera={camera}
        text={promptData.text}
      />

      {/* Caja de Diálogo Activa */}
      {activeDialogue && (
        <DialogueBox
          npcName={activeDialogue.name}
          lines={activeDialogue.lines}
          input={inputHandler}
          onComplete={() => {
            setActiveDialogue(null);
            isDialogueActiveRef.current = false;

            cameraControllerRef.current?.endDialogueMode();
          }}
        />
      )}

      {/* Controles Táctiles (solo fuera del menú) */}
      {sceneState !== 'MENU' && <TouchControls input={inputHandler} />}
    </div>
  );
}