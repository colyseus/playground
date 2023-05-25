/**
 * Monkey-patch Colyseus SDK to intercept and expose some private events
 */
import { Room, Protocol } from "colyseus.js";

export const RAW_EVENTS_KEY = '$_raw';
export const DEVMODE_RESTART = '$_devmode';

const onMessageCallback = Room.prototype['onMessageCallback'];
Room.prototype['onMessageCallback'] = function(event: MessageEvent) {
  const bytes = Array.from(new Uint8Array(event.data))

  // create local cache while the room is joining.
  // so we can consume them immediately when the join callback is called.
  if (!this['onMessageHandlers'].events[RAW_EVENTS_KEY]) {
    if (!(this as any)[RAW_EVENTS_KEY]) {
      (this as any)[RAW_EVENTS_KEY] = [];

      // intercept send events
      const originalSend = this.connection.transport['send'];
      this.connection.transport['send'] = (data: ArrayBuffer) => {
        const sendBytes = Array.from(new Uint8Array(data));

        this['onMessageHandlers'].emit(RAW_EVENTS_KEY, ['out', getEventType(sendBytes[0]), sendBytes]);
        originalSend.call(this.connection.transport, data);
      };

      const ws = (this.connection.transport as any).ws;

      const onError = ws.onerror;
      ws.onerror = (error: any) => {
        this['onMessageHandlers'].emit(RAW_EVENTS_KEY, ['error', 'ERROR', error.message]);
        onError(error);
      };

      // intercept close events
      const onClose = ws.onclose;
      ws.onclose = (event: any) => {
        if (event.code === 4010) {// CloseCode.DEVMODE_RESTART
          this['onMessageHandlers'].emit(DEVMODE_RESTART);
          this['onMessageHandlers'].emit(RAW_EVENTS_KEY, ['close', 'CLOSE_DEVMODE_RESTART', { code: event.code }]);

        } else {
          this['onMessageHandlers'].emit(RAW_EVENTS_KEY, ['close', 'CLOSE', { code: event.code }]);
        }
        onClose(event);
      };
    }
    (this as any)[RAW_EVENTS_KEY].unshift(['in', getEventType(bytes[0]), bytes, new Date()]);
  }

  this['onMessageHandlers'].emit(RAW_EVENTS_KEY, ['in', getEventType(bytes[0]), bytes ]);
  onMessageCallback.call(this, event);
}

function getEventType(code: number) {
  // TODO: fix nomenclature on SDK itself
  let eventType = Protocol[code].replace("ROOM_", "");
  if (eventType === "DATA") {
    eventType = "MESSAGE";
  }
  return eventType;
}