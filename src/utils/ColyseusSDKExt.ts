/**
 * Monkey-patch Colyseus SDK to expose some private events
 */
import { Room, Protocol } from "colyseus.js";

export const RAW_EVENTS_KEY = '$_raw';

const originalonMessageCallback = Room.prototype['onMessageCallback'];
Room.prototype['onMessageCallback'] = function(event: MessageEvent) {
  const bytes = Array.from(new Uint8Array(event.data))

  // create local cache while the room is joining.
  // so we can consume them immediately when the join callback is called.
  if (!this['onMessageHandlers'].events[RAW_EVENTS_KEY]) {
    if (!(this as any)[RAW_EVENTS_KEY]) { (this as any)[RAW_EVENTS_KEY] = []; }
    (this as any)[RAW_EVENTS_KEY].unshift([Protocol[bytes[0]], bytes, new Date()]);
  }

  this['onMessageHandlers'].emit(RAW_EVENTS_KEY, [Protocol[bytes[0]], bytes]);
  originalonMessageCallback.call(this, event);
}