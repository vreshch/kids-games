'use client';

import { Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

import type { Room } from '@/lib/crystal-rooms-level';

import { LetterSprite } from './letter-sprite';

type Props = { room: Room; collected: boolean };

export function KeyCrystal({ room, collected }: Props) {
  const group = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const [x, z] = [room.center[0] + room.keyPos[0], room.center[1] + room.keyPos[1]];

  useFrame((state, delta) => {
    if (!group.current || !spin.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = 1.1 + Math.sin(t * 2 + room.id) * 0.15;
    spin.current.rotation.y += delta * 1.2;
    const target = collected ? 0 : 1;
    const s = group.current.scale.x + (target - group.current.scale.x) * Math.min(1, delta * 6);
    group.current.scale.setScalar(Math.max(0.001, s));
    group.current.visible = s > 0.01;
  });

  return (
    <group position={[x, 0, z]}>
      <group ref={group} position={[0, 1.1, 0]}>
        <group ref={spin}>
          <mesh>
            <octahedronGeometry args={[0.55]} />
            <meshStandardMaterial
              color={room.color}
              emissive={room.color}
              emissiveIntensity={0.9}
              roughness={0.15}
              metalness={0.1}
              transparent
              opacity={0.92}
            />
          </mesh>
        </group>
        <LetterSprite letter={room.letter} color={room.color} position={[0, 1.15, 0]} />
        {!collected && <Sparkles count={10} scale={2.2} size={3} speed={0.5} color={room.color} />}
      </group>
      {!collected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.72, 32]} />
          <meshBasicMaterial color={room.color} transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}
