import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { WebSocketServer, type WebSocket } from 'ws';

const ROOM_PATH = /^\/relay\/([a-z0-9]{4,12})$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_ROOMS = 500;
const MAX_PAYLOAD = 64 * 1024;
const SWEEP_MS = 25_000;

/** Why the relay closed a socket; the game shows a message for each. */
export const CLOSE = { full: 4001, expired: 4002, busy: 4003 } as const;

export type RelayOptions = {
  /** Allowed `Origin` headers; `*` allows any. */
  origins: string[];
  maxAgeMs?: number;
  now?: () => number;
  version?: string;
};

/** Seat 0 is the host, seat 1 the guest. Rooms live in memory only. */
type Room = { createdAt: number; seats: [WebSocket | null, WebSocket | null] };

export function createRelay(options: RelayOptions) {
  const { origins, maxAgeMs = DAY_MS, now = Date.now, version = '' } = options;
  const rooms = new Map<string, Room>();
  const alive = new WeakSet<WebSocket>();
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_PAYLOAD });

  const tell = (ws: WebSocket | null, message: object) => ws?.send(JSON.stringify(message));
  const countOf = (room: Room) => room.seats.filter(Boolean).length;
  const announce = (room: Room) =>
    room.seats.forEach((ws) => tell(ws, { t: 'peers', count: countOf(room) }));

  function leave(id: string, room: Room, seat: number, ws: WebSocket) {
    if (room.seats[seat] !== ws) return;
    room.seats[seat] = null;
    if (countOf(room) === 0 && rooms.get(id) === room) rooms.delete(id);
    else announce(room);
  }

  function closeRoom(id: string, room: Room) {
    rooms.delete(id);
    room.seats.forEach((ws) => ws?.close(CLOSE.expired, 'room expired'));
  }

  function openRoom(id: string): Room | null {
    const old = rooms.get(id);
    if (old && now() - old.createdAt < maxAgeMs) return old;
    if (old) closeRoom(id, old);
    if (rooms.size >= MAX_ROOMS) return null;
    const room: Room = { createdAt: now(), seats: [null, null] };
    rooms.set(id, room);
    return room;
  }

  function join(ws: WebSocket, id: string) {
    ws.on('error', () => ws.terminate());
    const room = openRoom(id);
    if (!room) return ws.close(CLOSE.busy, 'relay busy');
    const seat = room.seats.indexOf(null);
    if (seat < 0) return ws.close(CLOSE.full, 'room full');
    room.seats[seat] = ws;
    alive.add(ws);
    ws.on('pong', () => alive.add(ws));
    ws.on('close', () => leave(id, room, seat, ws));
    ws.on('message', (data, isBinary) => {
      if (!isBinary) room.seats[1 - seat]?.send(data.toString());
    });
    tell(ws, { t: 'seat', seat });
    announce(room);
  }

  /** Ends day-old rooms and drops sockets that stopped answering pings. */
  function sweep() {
    for (const [id, room] of rooms) {
      if (now() - room.createdAt >= maxAgeMs) closeRoom(id, room);
    }
    for (const ws of wss.clients) {
      if (!alive.has(ws)) ws.terminate();
      alive.delete(ws);
      ws.ping();
    }
  }

  function health(_req: IncomingMessage, res: ServerResponse) {
    const data = {
      status: 'ok',
      service: 'kids-games-relay',
      version,
      commit: version.slice(0, 7),
      rooms: rooms.size,
      sockets: wss.clients.size,
    };
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ success: true, data }));
  }

  const server = createServer((req, res) => {
    if (req.url === '/relay/health') return health(req, res);
    res.writeHead(404).end();
  });

  const refuse = (socket: Duplex, status: string) =>
    socket.end(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`);

  server.on('upgrade', (req, socket, head) => {
    const id = ROOM_PATH.exec(req.url ?? '')?.[1];
    const origin = req.headers.origin ?? '';
    if (!id) return refuse(socket, '404 Not Found');
    if (!origins.includes('*') && !origins.includes(origin)) return refuse(socket, '403 Forbidden');
    wss.handleUpgrade(req, socket, head, (ws) => join(ws, id));
  });

  const timer = setInterval(sweep, SWEEP_MS);
  server.on('close', () => clearInterval(timer));

  const close = () => {
    for (const ws of wss.clients) ws.terminate();
    return new Promise((resolve) => server.close(resolve));
  };
  return { server, sweep, close };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.RELAY_PORT ?? 3001);
  const host = process.env.RELAY_HOST ?? '127.0.0.1';
  const origins = (process.env.RELAY_ORIGINS ?? 'https://games.vreshch.com').split(',');
  const relay = createRelay({ origins, version: process.env.COMMIT_SHA });
  relay.server.listen(port, host, () =>
    console.error(JSON.stringify({ level: 'info', msg: 'relay listening', host, port, origins }))
  );
  process.on('SIGTERM', () => void relay.close().then(() => process.exit(0)));
}
