import { Client, Room } from "colyseus.js";
import { LimitedArray } from "./LimitedArray";

export type Connection = {
  sessionId: string;
  isConnected: boolean;
  messages: LimitedArray;
  events: LimitedArray;
};

export const endpoint = `${window.location.protocol}//${window.location.host}${window.location.pathname.replace(/\/+$/, '')}`;
export const client = new Client();

export const global = { connections: [] as Connection[], };

export const roomsBySessionId: { [sessionId: string]: Room } = {};
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
