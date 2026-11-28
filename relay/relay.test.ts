import type { AddressInfo } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';

import { CLOSE, createRelay, type RelayOptions } from './relay';

type Relay = ReturnType<typeof createRelay>;
type Message = { t: string; seat?: number; count?: number; n?: number };
const ORIGIN = 'https://games.example';
let relay: Relay | null = null;
let port = 0;

async function start(options: Partial<RelayOptions> = {}) {
  relay = createRelay({ origins: [ORIGIN], version: 'abcdef1234', ...options });
  await new Promise<void>((resolve) => relay!.server.listen(0, '127.0.0.1', resolve));
  port = (relay.server.address() as AddressInfo).port;
}

/** A client that queues what it hears, so tests can await the next message or the close. */
function connect(path = '/relay/room1', origin = ORIGIN) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`, { origin });
  const inbox: Message[] = [];
  const waiting: ((message: Message) => void)[] = [];
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString()) as Message;
    const next = waiting.shift();
    if (next) next(message);
    else inbox.push(message);
  });
  const closed = new Promise<number>((resolve) => {
    ws.on('close', (code) => resolve(code));
    ws.on('error', () => resolve(-1));
  });
  const next = () =>
    inbox.length > 0
      ? Promise.resolve(inbox.shift()!)
      : new Promise<Message>((resolve) => waiting.push(resolve));
  return { ws, next, closed };
}

afterEach(async () => {
  await relay?.close();
  relay = null;
});

describe('relay', () => {
  it('seats the host first, the guest second, and tells both how many are in', async () => {
    await start();
    const host = connect();
    expect(await host.next()).toEqual({ t: 'seat', seat: 0 });
    expect(await host.next()).toEqual({ t: 'peers', count: 1 });
    const guest = connect();
    expect(await guest.next()).toEqual({ t: 'seat', seat: 1 });
    expect(await guest.next()).toEqual({ t: 'peers', count: 2 });
    expect(await host.next()).toEqual({ t: 'peers', count: 2 });
  });

  it('passes a message to the other seat only', async () => {
    await start();
    const host = connect();
    await host.next();
    await host.next();
    const guest = connect();
    await guest.next();
    await guest.next();
    await host.next();
    host.ws.send(JSON.stringify({ t: 'snap', n: 1 }));
    guest.ws.send(JSON.stringify({ t: 'input', n: 2 }));
    expect(await guest.next()).toEqual({ t: 'snap', n: 1 });
    expect(await host.next()).toEqual({ t: 'input', n: 2 });
  });

  it('turns a third player away and keeps rooms apart', async () => {
    await start();
    const host = connect();
    await host.next();
    const guest = connect();
    await guest.next();
    expect(await connect().closed).toBe(CLOSE.full);
    const other = connect('/relay/room2');
    expect(await other.next()).toEqual({ t: 'seat', seat: 0 });
  });

  it('frees the seat when a player leaves, so a refresh gets it back', async () => {
    await start();
    const host = connect();
    await host.next();
    await host.next();
    const guest = connect();
    await guest.next();
    await host.next();
    guest.ws.close();
    expect(await host.next()).toEqual({ t: 'peers', count: 1 });
    expect(await connect().next()).toEqual({ t: 'seat', seat: 1 });
  });

  it('gives each player the seat it claims, whoever comes back first after a restart', async () => {
    await start();
    const guest = connect('/relay/room1?seat=1');
    expect(await guest.next()).toEqual({ t: 'seat', seat: 1 });
    expect(await guest.next()).toEqual({ t: 'peers', count: 1 });
    const host = connect('/relay/room1?seat=0');
    expect(await host.next()).toEqual({ t: 'seat', seat: 0 });
    expect(await host.next()).toEqual({ t: 'peers', count: 2 });
    expect(await guest.next()).toEqual({ t: 'peers', count: 2 });
  });

  it('hands a claimed seat to the newcomer and tells the old socket why it went', async () => {
    await start();
    const stale = connect('/relay/room1?seat=0');
    await stale.next();
    const back = connect('/relay/room1?seat=0');
    expect(await back.next()).toEqual({ t: 'seat', seat: 0 });
    expect(await back.next()).toEqual({ t: 'peers', count: 1 });
    expect(await stale.closed).toBe(CLOSE.replaced);
    expect(await connect().next()).toEqual({ t: 'seat', seat: 1 });
  });

  it('ignores a seat claim it does not know', async () => {
    await start();
    expect(await connect('/relay/room1?seat=7').next()).toEqual({ t: 'seat', seat: 0 });
  });

  it('refuses a wrong origin and a bad room name', async () => {
    await start();
    expect(await connect('/relay/room1', 'https://evil.example').closed).toBe(-1);
    expect(await connect('/relay/NOT_OK').closed).toBe(-1);
    expect(await connect('/other').closed).toBe(-1);
  });

  it('ends a room after one day and lets the name be used again', async () => {
    let clock = 0;
    await start({ maxAgeMs: 1000, now: () => clock });
    const host = connect();
    await host.next();
    clock = 999;
    relay!.sweep();
    clock = 1000;
    relay!.sweep();
    expect(await host.closed).toBe(CLOSE.expired);
    expect(await connect().next()).toEqual({ t: 'seat', seat: 0 });
  });

  it('replaces a stale room when someone joins it late', async () => {
    let clock = 0;
    await start({ maxAgeMs: 1000, now: () => clock });
    const host = connect();
    await host.next();
    clock = 5000;
    const late = connect();
    expect(await host.closed).toBe(CLOSE.expired);
    expect(await late.next()).toEqual({ t: 'seat', seat: 0 });
  });

  it('drops a socket that stops answering pings', async () => {
    await start({ origins: ['*'] });
    const host = connect('/relay/room1', 'https://anything.example');
    await host.next();
    host.ws.pong = () => undefined;
    host.ws.removeAllListeners('ping');
    relay!.sweep();
    relay!.sweep();
    expect(await host.closed).not.toBe(1000);
  });

  it('reports health with the commit and live counts', async () => {
    await start();
    const host = connect();
    await host.next();
    const res = await fetch(`http://127.0.0.1:${port}/relay/health`);
    const body = (await res.json()) as { data: Record<string, unknown> };
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(body.data).toMatchObject({ status: 'ok', version: 'abcdef1234', rooms: 1, sockets: 1 });
    expect((await fetch(`http://127.0.0.1:${port}/nope`)).status).toBe(404);
  });
});
