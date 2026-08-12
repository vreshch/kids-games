'use client';

import { Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh, MeshStandardMaterial } from 'three';

import {
  DOOR_W,
  DOORS,
  HALF,
  PILLARS,
  ROOM,
  ROOMS,
  WALL_H,
  WALLS,
  type Door,
} from '@/lib/crystal-rooms-level';

import { LetterSprite } from './letter-sprite';

function CrystalDoor({ door, unlocked }: { door: Door; unlocked: boolean }) {
  const mesh = useRef<Mesh>(null);
  const room = ROOMS[door.id];

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const targetY = unlocked ? -WALL_H + 0.55 : WALL_H / 2 - 0.2;
    mesh.current.position.y += (targetY - mesh.current.position.y) * Math.min(1, delta * 2.5);
    const pulse = unlocked ? 0.25 : 0.55 + Math.sin(state.clock.elapsedTime * 2.4) * 0.25;
    (mesh.current.material as MeshStandardMaterial).emissiveIntensity = pulse;
  });

  const size: [number, number, number] =
    door.axis === 'x' ? [DOOR_W, WALL_H - 0.4, 0.42] : [0.42, WALL_H - 0.4, DOOR_W];

  return (
    <group position={[door.x, 0, door.z]}>
      <mesh ref={mesh} position={[0, WALL_H / 2 - 0.2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={room.color}
          emissive={room.color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.55}
          roughness={0.2}
        />
      </mesh>
      {!unlocked && (
        <LetterSprite
          letter={door.letter}
          color={room.color}
          position={[0, 1.4, 0]}
          scale={0.85}
          opacity={0.85}
        />
      )}
    </group>
  );
}

/** Little decorative crystal clusters hugging the room corners. */
function CornerCrystals({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      {[
        [0, 0.45, 0, 0.5],
        [0.5, 0.3, 0.2, 0.3],
        [-0.4, 0.25, 0.35, 0.26],
      ].map(([dx, h, dz, r], i) => (
        <mesh key={i} position={[dx, h, dz]} rotation={[0, i * 1.1, 0.15 * i]}>
          <coneGeometry args={[r, h * 2.4, 5]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.55}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

export function World({ unlockedDoors, won }: { unlockedDoors: number[]; won: boolean }) {
  const last = ROOMS[ROOMS.length - 1];
  return (
    <group>
      <color attach="background" args={['#0b1120']} />
      <fog attach="fog" args={['#0b1120', 16, 38]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#93c5fd', '#2a3a5e', 0.8]} />

      <mesh position={[HALF / 2, -0.06, -ROOM]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#16223d" />
      </mesh>

      {ROOMS.map((room) => (
        <group key={room.id}>
          <mesh position={[room.center[0], -0.02, room.center[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ROOM, ROOM]} />
            <meshStandardMaterial color={room.id === 4 && won ? '#312e81' : '#2a3a5e'} />
          </mesh>
          <pointLight
            position={[room.center[0], 3.4, room.center[1]]}
            color={room.color}
            intensity={55}
            distance={15}
          />
          <CornerCrystals
            x={room.center[0] - HALF + 1.2}
            z={room.center[1] - HALF + 1.2}
            color={room.color}
          />
          <CornerCrystals
            x={room.center[0] + HALF - 1.2}
            z={room.center[1] + HALF - 1.4}
            color={room.color}
          />
        </group>
      ))}

      {WALLS.map((wall, i) => (
        <mesh key={i} position={[wall.x, WALL_H / 2, wall.z]}>
          <boxGeometry args={[wall.hw * 2, WALL_H, wall.hd * 2]} />
          <meshStandardMaterial color="#42556f" roughness={0.9} />
        </mesh>
      ))}

      {PILLARS.map((pillar, i) => (
        <mesh key={i} position={[pillar.x, WALL_H / 2, pillar.z]}>
          <cylinderGeometry args={[pillar.hw + 0.1, pillar.hw + 0.25, WALL_H, 8]} />
          <meshStandardMaterial color="#54677f" roughness={0.8} />
        </mesh>
      ))}

      {DOORS.map((door) => (
        <CrystalDoor key={door.id} door={door} unlocked={unlockedDoors.includes(door.id)} />
      ))}

      {won && (
        <group position={[last.center[0], 0, last.center[1]]}>
          <Sparkles
            count={120}
            scale={[10, 5, 10]}
            size={6}
            speed={1.2}
            color="#fef08a"
            position={[0, 2.5, 0]}
          />
          {ROOMS.map((room, i) => (
            <LetterSprite
              key={i}
              letter={room.letter}
              color={room.color}
              position={[(i - 2) * 1.7, 3.1 + Math.sin(i * 1.3) * 0.3, -2]}
              scale={2}
            />
          ))}
        </group>
      )}
    </group>
  );
}
