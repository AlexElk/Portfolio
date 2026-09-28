'use client'

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

function Cube(){
    return(
        <mesh>
            <boxGeometry args={[1,1,1]}></boxGeometry>
            <meshStandardMaterial color="mediumPurple"></meshStandardMaterial>
        </mesh>
    );
}

export default function Scene() {
    return (
        <div style={{width: '100vw', height: '100vh'}}>
            <Canvas camera={{position: [3,3,3]}}>
                <ambientLight intensity={0.1}/>
                <directionalLight position={[5,5,5]} intensity={1} />
                <Cube />
                <OrbitControls />
            </Canvas>
        </div>
    );
}