'use client'

import { useEffect, useState } from "react";
import * as THREE from 'three';

interface InterfacePromptProps {
    position: THREE.Vector3 | null;
    camera: THREE.Camera | null;
    text: string;
    visible: boolean;
}

export default function InterfacePrompt({position, camera, text, visible}: InterfacePromptProps){
    const [screenPos, setScreenPos] = useState({x:0, y:0, isVisible: false});

    useEffect(() => {
        if (!position || !camera || !visible) return;

        let animId: number;

        const updatePosition = () => {
            camera.updateMatrixWorld();

            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            const toPosition = position.clone().sub(camera.position);

            if (toPosition.dot(cameraDirection) <= 0) {
                setScreenPos({ x: 0, y: 0, isVisible: false });
                animId = requestAnimationFrame(updatePosition);
                return;
            }
            //Proyection of 3D position to 3D normalized coordinates NDC(-1 to 1)
            const vector = position.clone();
            vector.project(camera);

            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

            //verify if it is behind the camera
            //const isBehind = vector.z > 1;

            setScreenPos({x, y, isVisible: true});
            animId = requestAnimationFrame(updatePosition);
        }

        updatePosition();
        return() => cancelAnimationFrame(animId);
    }, [position, camera, visible]);

    if (!visible || !screenPos.isVisible) return null;

    return(
        <div
            className="floating-prompt"
            style={{
                left: `${screenPos.x}px`,
                top: `${screenPos.y}px`
            }}
        >

            <div className="prompt-card">
                <span className="badge">E</span>
                {text ? <span className="text">{text}</span> : null}
            </div>

            <style jsx>{`
                .floating-prompt {
                position: absolute;
                transform: translate(-50%, -100%);
                pointer-events: none;
                z-index: 20;
                user-select: none;
                }

                .prompt-card {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #000000;
                border: 1px solid #ffffff;
                padding: 6px 12px;
                border-radius: 0;
                }

                .badge {
                background: #000000;
                color: #ffffff;
                font-weight: bold;
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 0;
                }

                .text {
                color: white;
                font-size: 13px;
                font-weight: 500;
                }

            `}</style>

        </div>
    );

}