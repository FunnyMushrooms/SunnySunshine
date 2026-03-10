import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type OrbProps = { color: string; side: -1 | 1 };

function EnergyOrb({ color, side }: OrbProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = side * 1.2 + mouse.x * 0.35;
    ref.current.position.y = Math.sin(t + side) * 0.18 + mouse.y * 0.15;
    ref.current.rotation.y = t * 0.45;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.4;
  });

  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={0.6}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.9, 7]} />
        <meshPhysicalMaterial color={color} roughness={0.22} transmission={0.12} thickness={1.2} emissive={color} emissiveIntensity={0.28} />
      </mesh>
    </Float>
  );
}

function ConnectionField() {
  const points = useMemo(() => {
    const arr = new Float32Array(600);
    for (let i = 0; i < 600; i += 3) {
      arr[i] = (Math.random() - 0.5) * 7;
      arr[i + 1] = (Math.random() - 0.5) * 3.5;
      arr[i + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#72baff" size={0.018} transparent opacity={0.7} />
    </points>
  );
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4.8], fov: 42 }}>
      <color attach="background" args={['#04060d']} />
      <fog attach="fog" args={['#04060d', 3.8, 8]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[-2, 1, 2]} intensity={2} color="#ef4d59" />
      <pointLight position={[2, 1, 2]} intensity={2} color="#4ab3ff" />
      <ConnectionField />
      <EnergyOrb color="#ef4d59" side={-1} />
      <EnergyOrb color="#4ab3ff" side={1} />
      <Environment preset="city" />
    </Canvas>
  );
}
