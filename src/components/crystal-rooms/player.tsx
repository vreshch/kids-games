'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { Group, Vector3 } from 'three';

import {
  collide,
  doorBox,
  DOORS,
  PLAYER_R,
  ROOMS,
  START_POS,
  WALLS,
} from '@/lib/crystal-rooms-level';

import type { MoveInput } from './controls';

const SPEED = 4.6;
const CAMERA_OFFSET = new Vector3(0, 6.5, 7.2);
const PICKUP_DIST = 1.25;

type Props = {
  input: RefObject<MoveInput>;
  collected: number[];
  onCollect: (roomId: number) => void;
  frozen: boolean;
};

export function Player({ input, collected, onCollect, frozen }: Props) {
  const group = useRef<Group>(null);
  const facing = useRef(Math.PI);
  const camera = useThree((s) => s.camera);
  const lookTarget = useRef(new Vector3(START_POS[0], 0.8, START_POS[1]));

  const colliders = useMemo(
    () => [...WALLS, ...DOORS.filter((d) => !collected.includes(d.id)).map(doorBox)],
    [collected]
  );

  useFrame((state, rawDelta) => {
    const body = group.current;
    if (!body) return;
    const delta = Math.min(rawDelta, 0.05);
    const move = input.current;
    const moving = !frozen && (move.x !== 0 || move.z !== 0);

    if (moving) {
      const [nx, nz] = collide(
        body.position.x + move.x * SPEED * delta,
        body.position.z + move.z * SPEED * delta,
        PLAYER_R,
        colliders
      );
      body.position.x = nx;
      body.position.z = nz;
      const target = Math.atan2(move.x, move.z);
      let diff = target - facing.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      facing.current += diff * Math.min(1, delta * 12);
      body.rotation.y = facing.current;
      body.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 9)) * 0.08;
    } else {
      body.position.y += (0 - body.position.y) * Math.min(1, delta * 10);
    }

    for (const room of ROOMS) {
      if (collected.includes(room.id)) continue;
      const kx = room.center[0] + room.keyPos[0];
      const kz = room.center[1] + room.keyPos[1];
      if (Math.hypot(body.position.x - kx, body.position.z - kz) < PICKUP_DIST) {
        onCollect(room.id);
      }
    }

    const camTarget = new Vector3(body.position.x, 0, body.position.z).add(CAMERA_OFFSET);
    const ease = 1 - Math.exp(-3.5 * delta);
    camera.position.lerp(camTarget, ease);
    lookTarget.current.lerp(new Vector3(body.position.x, 0.8, body.position.z), ease);
    camera.lookAt(lookTarget.current);
  });

  return (
    <group ref={group} position={[START_POS[0], 0, START_POS[1]]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.34, 0.45, 6, 14]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.32, 0]}>
        <sphereGeometry args={[0.3, 20, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.4} />
      </mesh>
      {[-0.11, 0.11].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.38, 0.26]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[x, 1.38, 0.31]}>
            <sphereGeometry args={[0.028, 8, 6]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.72, 0]} rotation={[0, 0, 0.08]}>
        <coneGeometry args={[0.16, 0.34, 5]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
