import path from "path";
import express from "express";
import { matchMaker, RoomListingData } from '@colyseus/core';
import { allRoomNames } from "./colyseus.ext";

export const playground = express.Router();

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
    roomsById
  });
});
