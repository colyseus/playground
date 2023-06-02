import { Server } from '@colyseus/core';

const originalDefine = Server.prototype.define;
export const allRoomNames: string[] = [];

// @ts-ignore
Server.prototype.define = function(name, handler, options) {
    allRoomNames.push(name);

    const definition = originalDefine.call(this, name, handler, options);

    // notify client about all registered message handlers
    definition.on("join", (room, client) => {
        client.send("__playground_message_types", Object.keys(room['onMessageHandlers']));
    });

    return definition
};