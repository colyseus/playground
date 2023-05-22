import { Room } from "colyseus.js";

export type Connection = {
  sessionId: string;
  isConnected: boolean;
  messages: any[];
  error?: any;
  events?: any[];
};

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

export function getRoomColor(roomId: string) {
  if (!colorsByRoomId[roomId]) {
    if (currentColor >= allRoomColors.length) {
      currentColor = 0;
    }
    colorsByRoomId[roomId] = allRoomColors[currentColor];
    currentColor++;
  }
  return colorsByRoomId[roomId];
}
export const colorsByRoomId: {[roomId: string]: string} = {};

export const matchmakeMethods: {[key: string]: string} = {
	"joinOrCreate": "Join or Create",
	"create": "Create",
	"join": "Join",
	"joinById": "Join by ID",
};