'use client';

import { useRef, useState } from "react";
import { InputHandler } from "../game/InputHandler";

interface TouchControlProps {
    input: InputHandler | null;
}

export default function TouchControls({input}: TouchControlProps)
{
    const joystickRef = useRef<HTMLDivElement>(null);
    const joystickPointerRef = useRef<number | null>(null);
    const [knobPosition, setKnobPosition] = useState({x: 0, y: 0});

    const setMovement = (x: number, y: number) => {
    if (!input) return;

        const deadzone = 0.18;
        input.setKey('a', x < -deadzone);
        input.setKey('d', x > deadzone);
        input.setKey('w', y < -deadzone);
        input.setKey('s', y > deadzone);
    };

    const updateJoystick = (clientX: number, clientY: number) => {
        const joystick = joystickRef.current;
        if (!joystick) return;

        const bounds = joystick.getBoundingClientRect();
        const radius = bounds.width / 2;
        const knobRadius = 28;
        const maxDistance = radius - knobRadius;
        const offsetX = clientX - (bounds.left + radius);
        const offsetY = clientY - (bounds.top + radius);
        const distance = Math.hypot(offsetX, offsetY);
        const scale = distance > maxDistance ? maxDistance / distance : 1;
        const knobX = offsetX * scale;
        const knobY = offsetY * scale;

        setKnobPosition({x: knobX, y: knobY});
        setMovement(knobX / maxDistance, knobY / maxDistance);
    };

    const handleJoystickStart = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        joystickPointerRef.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateJoystick(e.clientX, e.clientY);
    };

    const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (joystickPointerRef.current !== e.pointerId) return;
        e.stopPropagation();
        updateJoystick(e.clientX, e.clientY);
    };

    const resetJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
        if (joystickPointerRef.current !== e.pointerId) return;
        e.stopPropagation();
        joystickPointerRef.current = null;
        setKnobPosition({x: 0, y: 0});
        setMovement(0, 0);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    const handleAction = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!input) return;
        input.handleSpace();
    };

    const handleJumpStart = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!input) return;
        input.pressJump();
    };

    const handleJumpEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!input) return;
        input.releaseJump();
    };

    if (!input) return null;

    return (
        <div className="touch-overlay">
        <div
            ref={joystickRef}
            className="joystick"
            onPointerDown={handleJoystickStart}
            onPointerMove={handleJoystickMove}
            onPointerUp={resetJoystick}
            onPointerCancel={resetJoystick}
            onLostPointerCapture={resetJoystick}
        >
            <div
                className="joystick-knob"
                style={{transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`}}
            />
        </div>

        <div className="button-cluster">
            <button
            className="btn btn-action"
                onPointerDown={handleAction}
            >
                ACTION
            </button>
            <button
                className="btn btn-jump"
                onPointerDown={handleJumpStart}
                onPointerUp={handleJumpEnd}
                onPointerCancel={handleJumpEnd}
                onLostPointerCapture={handleJumpEnd}
                onPointerLeave={handleJumpEnd}
            >
                JUMP
            </button>
        </div>

        <style jsx>{`
            .touch-overlay {
            position: absolute;
            bottom: 24px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 24px;
            pointer-events: none; /* Allows click on canvas*/
            z-index: 10;
            user-select: none;
            }

            /* Hide on computer */
            @media (hover: hover) and (pointer: fine) {
            .touch-overlay {
                display: none;
            }
            }

            .joystick, .button-cluster {
            pointer-events: auto; /* Enable the button's interact */
            }

            .joystick {
            width: 128px;
            height: 128px;
            border: 2px solid rgba(255, 255, 255, 0.45);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.8);
            touch-action: none;
            position: relative;
            }

            .joystick-knob {
            width: 56px;
            height: 56px;
            position: absolute;
            left: 50%;
            top: 50%;
            margin: -28px 0 0 -28px;
            background: #000000;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            }

            .button-cluster {
            display: flex;
            gap: 12px;
            align-items: center;
            }

            .btn {
            width: 64px;
            height: 64px;
            background: #000000;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            color: white;
            font-family: inherit;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            touch-action: none;
            }

            .btn:active {
            background: #000000;
            border-color: #ffffff;
            }

            .btn-action {
            background: #000000;
            border-color: #ffffff;
            }

            .btn-jump {
            background: #000000;
            }
        `}</style>
        </div>
    );
}