// broadcast.ts - Serwis do obsługi broadcastowania zdarzeń w aplikacji Vue
// globalny - punkt centralny - dystrybucja

import * as signalR from "@microsoft/signalr";
import mitt from 'mitt';

export type UiChangePayload = {
  target?: string;
  action: string;
  data?: unknown;
};

const emitter = mitt<{ uiChange: UiChangePayload; receiveMessage: string; }>();
export function useUiBroadcast() {
  return emitter;
}

//connection
const signalRUrl = import.meta.env.VUE_SIGNALR_URL || "http://localhost:5171/broadcast";

export const connection = new signalR.HubConnectionBuilder()
  .withUrl(signalRUrl, { withCredentials: true })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Debug)
  .build();

const bus = useUiBroadcast();

let reconnectTimeout: number | null = null;
let listenersAttached: boolean = false;
let retryCount: number = 0;

export async function startSignalR() {
  //return null;
  try {
    if (!listenersAttached) {
      connection.onclose((error) => {
        if (error) {
          console.error("SignalR Connection closed with error:", error);
          bus.emit("uiChange", { target: "broadcast-status", action: "update", data: { status: "Error: Disconneted" } });
          bus.emit('receiveMessage', error.message || error.toString());
        } else {
          bus.emit("uiChange", { target: "broadcast-status", action: "update", data: { status: "Connection closed" } });
        }
        //if (!reconnectTimeout) {
        //  retryCount++;
        //  const retryInterval = retryCount <= 3 ? 5000 : 60000;
        //  reconnectTimeout = setTimeout(() => {
        //    reconnectTimeout = null;
        //    startSignalR();
        //  }, retryInterval);
        //}
      });
      listenersAttached = true;
    }

    await connection.start();
    retryCount = 0;
    console.log("SignalR Connected!");
    bus.emit('uiChange', { target: "broadcast-status", action: "update", data: { status: "Connected ✅" } });
  }
  catch(err: any) {
    console.error("SignalR Connection Error: ", err);
    bus.emit('uiChange', { target: "broadcast-status", action: "update", data: { status: "Error: retrying" } });
    bus.emit('receiveMessage', err?.message || err?.toString?.() || String(err));

    if (!reconnectTimeout) {
      retryCount++;
      const retryInterval = retryCount <= 3 ? 5000 : 60000;
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        startSignalR();
      }, retryInterval);
    }
  }
}
export function checkState(): string {
  switch (connection.state) {
    case signalR.HubConnectionState.Connected:
      return 'Connected';
    case signalR.HubConnectionState.Connecting:
      return 'Connecting';
    case signalR.HubConnectionState.Reconnecting:
      return 'Reconnecting';
    case signalR.HubConnectionState.Disconnected:
    default:
      return 'Disconnected';
  }
}
export function checkStateRaw(): signalR.HubConnectionState {
  return connection.state;
}




//// BroadcastCallback - Typ dla funkcji callback, które będą wywoływane przy publikacji zdarzeń
//type BroadcastCallback = (data: any) => void;

//// BroadcastService - Serwis do zarządzania kanałami i subskrypcjami
//class BroadcastService {
//  // channels - Mapa przechowująca kanały i ich subskrybentów
//  private channels: Map<string, BroadcastCallback[]> = new Map();

//  subscribe(channel: string, callback: BroadcastCallback): void {
//    if (!this.channels.has(channel)) {
//      this.channels.set(channel, []);
//    }
//    this.channels.get(channel)!.push(callback);
//  }

//  unsubscribe(channel: string, callback: BroadcastCallback): void {
//    const callbacks = this.channels.get(channel);
//    if (callbacks) {
//      this.channels.set(
//        channel,
//        callbacks.filter(cb => cb !== callback)
//      );
//    }
//  }

//  publish(channel: string, data: any): void {
//    const callbacks = this.channels.get(channel);
//    if (callbacks) {
//      callbacks.forEach(cb => cb(data));
//    }
//  }
//}

//const broadcastService = new BroadcastService();

//export default broadcastService;
