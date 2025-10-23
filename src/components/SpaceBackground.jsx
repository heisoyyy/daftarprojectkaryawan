// src/components/SpaceBackground.jsx
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import "./SpaceBackground.css";

function AnimatedStars() {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0005;
      ref.current.rotation.x += 0.0002;
    }
  });

  return (
    <group ref={ref}>
      <Stars
        radius={120}
        depth={50}
        count={6000}
        factor={4}
        fade
        speed={0.5}
      />
    </group>
  );
}

function Nebula() {
  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial
        side={THREE.BackSide}
        color="#0a0f24"
        opacity={0.7}
        transparent
      />
    </mesh>
  );
}

export default function SpaceBackground() {
  return (
    <div className="three-background">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ambientLight intensity={0.5} />
        <Nebula />
        <AnimatedStars />
      </Canvas>
    </div>
  );
}
