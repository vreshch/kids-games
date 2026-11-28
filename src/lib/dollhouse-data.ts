export type CharId = 'daddy' | 'girl' | 'baby' | 'cat';
export type Floor = 0 | 1;
/** 0 ground left, 1 ground right, 2 top left, 3 top right. */
export type RoomId = 0 | 1 | 2 | 3;
export type SecretId = 'picture' | 'cupboard' | 'hole';
export type ItemId = 'key' | 'flashlight' | 'teddy' | 'gold-key' | 'lantern' | 'rocket';
export type Slot = 'wallL' | 'floorA' | 'floorB';
export type Spot = { room: RoomId; slot: Slot };
export type IceColor = 'blue' | 'pink' | 'green' | 'yellow' | 'purple';
export type Secret = { id: SecretId; spot: Spot; needs: ItemId | null };

export type HouseDef = {
  name: string;
  roomNames: [string, string, string, string];
  roomColors: [string, string, string, string];
  wall: string;
  roof: string;
  items: [ItemId, ItemId, ItemId];
  presents: [Spot, Spot, Spot];
  machine: Spot;
  secrets: Secret[];
};

export const CHARS: CharId[] = ['daddy', 'girl', 'baby', 'cat'];
export const CHAR_NAMES: Record<CharId, string> = {
  daddy: 'Daddy',
  girl: 'Girl',
  baby: 'Baby',
  cat: 'Kitty',
};
export const START_ROOMS: Record<CharId, RoomId> = { daddy: 0, girl: 1, baby: 2, cat: 3 };
export const SECRET_IDS: SecretId[] = ['picture', 'cupboard', 'hole'];
export const ICE_COLORS: Record<IceColor, string> = {
  blue: '#38bdf8',
  pink: '#f472b6',
  green: '#4ade80',
  yellow: '#facc15',
  purple: '#a78bfa',
};

export const floorOf = (room: RoomId): Floor => (room >> 1) as Floor;
export const sideOf = (room: RoomId): 0 | 1 => (room & 1) as 0 | 1;
export const roomAt = (floor: Floor, side: 0 | 1): RoomId => (floor * 2 + side) as RoomId;

const at = (room: RoomId, slot: Slot): Spot => ({ room, slot });

export const HOUSES: [HouseDef, HouseDef] = [
  {
    name: 'Sunny house',
    roomNames: ['Yellow room', 'Green room', 'Pink room', 'Blue room'],
    roomColors: ['#fde68a', '#bbf7d0', '#fbcfe8', '#bae6fd'],
    wall: '#a16207',
    roof: '#dc2626',
    items: ['key', 'flashlight', 'teddy'],
    presents: [at(0, 'floorB'), at(3, 'floorB'), at(1, 'floorA')],
    machine: at(2, 'floorB'),
    secrets: [
      { id: 'picture', spot: at(2, 'wallL'), needs: null },
      { id: 'cupboard', spot: at(3, 'floorA'), needs: 'key' },
      { id: 'hole', spot: at(1, 'floorB'), needs: 'flashlight' },
    ],
  },
  {
    name: 'Berry house',
    roomNames: ['Lilac room', 'Orange room', 'Mint room', 'Rose room'],
    roomColors: ['#ddd6fe', '#fed7aa', '#99f6e4', '#fecdd3'],
    wall: '#6d28d9',
    roof: '#0d9488',
    items: ['gold-key', 'lantern', 'rocket'],
    presents: [at(2, 'floorB'), at(0, 'floorA'), at(3, 'floorB')],
    machine: at(3, 'floorA'),
    secrets: [
      { id: 'picture', spot: at(1, 'wallL'), needs: null },
      { id: 'cupboard', spot: at(0, 'floorB'), needs: 'gold-key' },
      { id: 'hole', spot: at(2, 'floorA'), needs: 'lantern' },
    ],
  },
];
