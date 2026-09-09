import { describe, expect, it } from 'vitest';

import {
  buildLevel,
  collide,
  doorBox,
  DOOR_W,
  PLAYER_R,
  WALL_T,
  wordPoolForLevel,
  WORDS,
} from './crystal-rooms-level';

describe('WORDS', () => {
  it('are uppercase A-Z, short enough for small legs', () => {
    for (const word of WORDS) expect(word).toMatch(/^[A-Z]{3,8}$/);
  });

  it('spells ALISA correctly', () => {
    expect(WORDS).toContain('ALISA');
    expect(WORDS).not.toContain('ALYSA');
  });
});

describe('wordPoolForLevel', () => {
  it('serves 3-letter words at level 1, one letter more per level', () => {
    expect(wordPoolForLevel(1).every((w) => w.length === 3)).toBe(true);
    expect(wordPoolForLevel(2).every((w) => w.length === 4)).toBe(true);
    expect(wordPoolForLevel(3).every((w) => w.length === 5)).toBe(true);
  });

  it('never returns an empty pool, even far past the longest word', () => {
    for (let level = 1; level <= 30; level++) {
      expect(wordPoolForLevel(level).length).toBeGreaterThan(0);
    }
  });
});

describe('buildLevel', () => {
  it('adds more pillars as difficulty rises', () => {
    const counts = [1, 2, 3, 4].map((d) => buildLevel('FLOWER', d).pillars.length);
    expect(counts[0]).toBe(0);
    expect(counts[1]).toBeGreaterThan(counts[0]);
    expect(counts[2]).toBeGreaterThan(counts[1]);
    expect(counts[3]).toBeGreaterThan(counts[2]);
  });

  it('keeps start and every key clear of pillars at max difficulty', () => {
    for (const word of WORDS) {
      const level = buildLevel(word, 9);
      const boxes = [...level.walls, ...level.pillars];
      expect(collide(level.start[0], level.start[1], PLAYER_R, boxes)).toEqual(level.start);
      for (const room of level.rooms) {
        const keyX = room.center[0] + room.keyPos[0];
        const keyZ = room.center[1] + room.keyPos[1];
        expect(collide(keyX, keyZ, PLAYER_R, boxes)).toEqual([keyX, keyZ]);
      }
    }
  });

  it.each(WORDS)('builds one room per letter for %s', (word) => {
    const level = buildLevel(word);
    expect(level.rooms.map((room) => room.letter).join('')).toBe(word);
    expect(level.doors).toHaveLength(word.length - 1);
    expect(level.walls.length).toBeGreaterThan(0);
  });

  it('never places two rooms on the same cell', () => {
    for (const word of WORDS) {
      const level = buildLevel(word);
      const centers = new Set(level.rooms.map((room) => room.center.join(',')));
      expect(centers.size).toBe(level.rooms.length);
    }
  });

  it('starts the player clear of every wall and pillar', () => {
    for (const word of WORDS) {
      const { start, walls, pillars } = buildLevel(word);
      expect(collide(start[0], start[1], PLAYER_R, [...walls, ...pillars])).toEqual(start);
    }
  });

  it('places every key clear of walls and pillars', () => {
    for (const word of WORDS) {
      const level = buildLevel(word);
      const boxes = [...level.walls, ...level.pillars];
      for (const room of level.rooms) {
        const keyX = room.center[0] + room.keyPos[0];
        const keyZ = room.center[1] + room.keyPos[1];
        expect(collide(keyX, keyZ, PLAYER_R, boxes)).toEqual([keyX, keyZ]);
      }
    }
  });
});

describe('collide', () => {
  it('pushes an overlapping circle out of a box', () => {
    const [x, z] = collide(1.2, 0, 0.5, [{ x: 0, z: 0, hw: 1, hd: 1 }]);
    expect(x).toBeCloseTo(1.5);
    expect(z).toBeCloseTo(0);
  });

  it('leaves a clear circle alone', () => {
    expect(collide(5, 5, 0.5, [{ x: 0, z: 0, hw: 1, hd: 1 }])).toEqual([5, 5]);
  });

  it('pushes a fully swallowed circle out along the shallow axis', () => {
    const [x] = collide(0.9, 0, 0.5, [{ x: 0, z: 0, hw: 1, hd: 4 }]);
    expect(x).toBeGreaterThan(1);
  });
});

describe('doorBox', () => {
  it('spans the door width at wall thickness', () => {
    for (const door of buildLevel('APPLE').doors) {
      const box = doorBox(door);
      expect(Math.max(box.hw, box.hd)).toBe(DOOR_W / 2);
      expect(Math.min(box.hw, box.hd)).toBe(WALL_T / 2);
    }
  });
});
