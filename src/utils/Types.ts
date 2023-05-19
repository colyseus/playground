import { Room } from "colyseus.js";

export type Connection = Room & {
	messages: any[];
	error?: any;
	events?: any[];
};