import http from "http";
import { Server, Room, Client, ClientState } from '@colyseus/core';

const originalDefine = Server.prototype.define;
export const allRoomNames: string[] = [];

const original_onJoin = Room.prototype._onJoin;

Room.prototype._onJoin = async function(client: Client, req?: http.IncomingMessage) {
  const result = await original_onJoin.apply(this, arguments);

  if (client.state === ClientState.JOINING) {
    client.send("__playground_message_types", Object.keys(this['onMessageHandlers']));
  }

  return result;
}

// @ts-ignore
Server.prototype.define = function(name, handler, options) {
    allRoomNames.push(name);
    return originalDefine.call(this, name, handler, options);
};