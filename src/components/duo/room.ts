import { isRoomId } from '@/lib/duo-room';

const CLOSE_FULL = 4001;
const CLOSE_EXPIRED = 4002;
const RETRY_MS = 2000;

export type Drop = 'lost' | 'full' | 'expired';
export type Room<M> = { send: (message: M) => void; close: () => void };
type Handlers<M> = {
  onSeat: (seat: number) => void;
  onPeers: (count: number) => void;
  onMessage: (message: M) => void;
  onDrop: (why: Drop) => void;
};
/** The relay's own messages; anything else comes from the other player. */
type RelayMessage = { t: 'seat'; seat: number } | { t: 'peers'; count: number } | { t: 'other' };

/** Same host under /relay in production; the local relay port in dev. */
export function relayUrl(room: string) {
  const local = `ws://${location.hostname}:3001`;
  const base =
    process.env.NEXT_PUBLIC_RELAY_URL ??
    (location.protocol === 'https:' ? `wss://${location.host}` : local);
  return `${base}/relay/${room}`;
}

/** The room from an invite link (`?room=...`), if the page was opened with one. */
export function roomInUrl() {
  const room = new URLSearchParams(location.search).get('room');
  return isRoomId(room) ? room : null;
}

const dropOf = (code: number): Drop =>
  code === CLOSE_FULL ? 'full' : code === CLOSE_EXPIRED ? 'expired' : 'lost';

/** One relay room. A lost connection is dialled again until `close` is called. */
export function openRoom<M extends { t: string }>(id: string, handlers: Handlers<M>): Room<M> {
  let ws: WebSocket | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  const hear = (data: string) => {
    const message = JSON.parse(data) as RelayMessage;
    if (message.t === 'seat') handlers.onSeat(message.seat);
    else if (message.t === 'peers') handlers.onPeers(message.count);
    else handlers.onMessage(message as unknown as M);
  };
  const dial = () => {
    ws = new WebSocket(relayUrl(id));
    ws.onmessage = (e) => hear(String(e.data));
    ws.onclose = (e) => {
      if (closed) return;
      const why = dropOf(e.code);
      handlers.onDrop(why);
      if (why === 'lost') retry = setTimeout(dial, RETRY_MS);
    };
  };
  dial();

  return {
    send: (message) => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
    },
    close: () => {
      closed = true;
      clearTimeout(retry);
      ws?.close();
    },
  };
}
