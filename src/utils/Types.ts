import { Client, Room } from "colyseus.js";

export type Connection = {
  sessionId: string;
  isConnected: boolean;
  messages: any[];
  events: any[];
  error?: any;
};

export const endpoint = "http://localhost:2567";
export const client = new Client(endpoint);

export const global = { connections: [] as Connection[], };

export const roomsBySessionId: { [key: string]: Room } = {};
export const messageTypesByRoom: { [key: string]: string[] } = {};

let currentColor = -1;
export const allRoomColors: string[] = [
  "cyan",
  "blue",
  "violet",
  "fuchsia",
  "green",
  "rose",
  // "sky",
  // "pink",
  // "emerald",
  // "lime",
  // "indigo",
  // "teal",
];
// ,"stone", "amber", "yellow", "purple"

export function getRoomColorClass(roomId: string) {
  if (!colorsByRoomId[roomId]) {
    if (currentColor >= allRoomColors.length) {
      currentColor = 0;
    }
    colorsByRoomId[roomId] = allRoomColors[currentColor];
    currentColor++;
  }
  return "bg-" + colorsByRoomId[roomId] + "-800";
}
export const colorsByRoomId: {[roomId: string]: string} = {};

export const matchmakeMethods: {[key: string]: string} = {
	"joinOrCreate": "Join or Create",
	"create": "Create",
	"join": "Join",
	"joinById": "Join by ID",
};