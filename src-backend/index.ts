import path from "path";
import express from "express";
import { auth, JWT } from "@colyseus/auth";
import { matchMaker, RoomListingData } from '@colyseus/core';
import { allRoomNames } from "./colyseus.ext";

export const playground = express.Router();

export type AuthConfig = {
  oauth: string[],
  register: boolean,
  anonymous: boolean,
};

// serve static frontend
playground.use("/", express.static(path.resolve(__dirname, "..", "build")));

// expose matchmaking stats
playground.get("/rooms", async (req, res) => {
  const rooms = await matchMaker.driver.find({});

  const roomsByType: { [roomName: string]: number } = {};
  const roomsById: { [roomName: string]: RoomListingData } = {};

  rooms.forEach((room) => {
    if (!roomsByType[room.name]) { roomsByType[room.name] = 0; }
    roomsByType[room.name]++;
    roomsById[room.roomId] = room;
  });

  res.json({
    rooms: allRoomNames,

    roomsByType,
    roomsById,

    auth: {
      // list of OAuth providers
      oauth: Object.keys(auth.oauth.providers),
      register: typeof(auth.settings.onRegisterWithEmailAndPassword) === "function",
      anonymous: typeof(JWT.settings.secret) === "string",
    } as AuthConfig
  });
});
