import http from "http";
import { Server, Room, Client, ClientState, ClientPrivate, spliceOne } from '@colyseus/core';

export let allRoomNames: string[] = [];

const define = Server.prototype.define;
// @ts-ignore
Server.prototype.define = function(name, handler, options) {
    allRoomNames.push(name);
    return define.call(this, name, handler, options);
};

const removeRoomType = Server.prototype.removeRoomType;
Server.prototype.removeRoomType = function(name) {
    const removeIndex = allRoomNames.findIndex((roomName) => roomName === name);
    if (removeIndex !== -1) {
        spliceOne(allRoomNames, removeIndex);
    }
    return removeRoomType.call(this, name);
};

export function applyMonkeyPatch() {
  const _onJoin = Room.prototype._onJoin;
  Room.prototype._onJoin = async function (client: Client & ClientPrivate, req?: http.IncomingMessage) {
    const result = await _onJoin.apply(this, [client, req]);

    if (client.state === ClientState.JOINING) {
      const messageTypes = Object.keys(this['onMessageHandlers']).filter((type) => type.indexOf("__") !== 0)
      client.send("__playground_message_types", messageTypes);
    }

    return result;
  }
}