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

export const matchmakeMethods: {[key: string]: string} = {
	"joinOrCreate": "Join or Create",
	"create": "Create",
	"join": "Join",
	"joinById": "Join by ID",
};