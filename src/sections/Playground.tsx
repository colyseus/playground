import { Client, Room } from "colyseus.js";
import { useEffect, useState } from "react";

import { InspectConnection } from "../components/InspectConnection";
import { Connection, roomsBySessionId, messageTypesByRoom } from "../utils/Types";
import { ConnectionList } from "../components/ConnectionList";
import { JoinRoomForm } from "../components/JoinRoomForm";
import { StateView } from "../components/StateView";

const endpoint = "http://localhost:2567";
const client = new Client(endpoint);

enum ServerState {
	CONNECTING = "connecting",
	CONNECTED = "connected",
	OFFLINE = "offline",
}

// WORKAROUND:
let allConnections: Connection[] = [];

export function Playground() {
	const [serverState, setServerState] = useState(ServerState.CONNECTING);
	const [roomNames, setRoomNames] = useState([]);
	const [connections, setConnections] = useState([] as Connection[]);
	const [selectedConnection, setSelectedConnection] = useState(undefined as unknown as Connection);

	const disconnectClient = function (sessionId: string) {
		const connection = allConnections.find((connection) => connection.sessionId === sessionId);
		connection!.isConnected = false;
		setConnections([...allConnections]);
	}

	// create new connection to server
	const createClientConnection = async (method: keyof Client, roomName: string, options: string) => {
		try {
			const room = (await client[method](roomName, JSON.parse(options))) as Room;
			roomsBySessionId[room.sessionId] = room;

			const connection: Connection = {
				sessionId: room.sessionId,
				isConnected: true,
				messages: [],
				events: [],
				error: undefined,
			};

			// prepend received messages
			room.onMessage("*", (type, message) =>
				connection.messages.unshift({ type, message, in: true, now: performance.now() }));

			room.onLeave(() => disconnectClient(room.sessionId));

			room.onError((code, message) => { });

			room.onMessage("__playground_message_types", (types) => {
				// global message types by room name
				messageTypesByRoom[room.name] = types;

				// append connection to connections list
				allConnections = [connection, ...allConnections];
				setConnections(allConnections);

				// auto-select if first connection
				if (selectedConnection === undefined) {
					setSelectedConnection(connection);
				}
			});

		} catch (e: any) {
			const error = e.target?.statusText || e.message || "server is down.";
			setConnections([{ error } as Connection, ...connections]);
		}
	};

	// fetch rooms on mount
	useEffect(() => {
		fetch(`${endpoint}/playground/rooms`).
			then((response) => response.json()).
			then((rooms) => {
				setServerState(ServerState.CONNECTED);
				setRoomNames(rooms);
			}).
			catch((e) => {
				setServerState(ServerState.OFFLINE);
				console.error(e)
			});
	}, []);

	return <>
		<div className="mt-14 grid grid-cols-2 gap-6">

			<div className="bg-white rounded p-6">
				{(serverState === ServerState.CONNECTING) && <p>Connecting to server...</p>}
				{(serverState === ServerState.OFFLINE) && <p>Server is offline.</p>}
				{(serverState === ServerState.CONNECTED) &&
					<JoinRoomForm
						roomNames={roomNames}
						createClientConnection={createClientConnection}
					/>}
			</div>

			<ConnectionList
				connections={connections}
				selectedConnection={selectedConnection}
				setSelectedConnection={setSelectedConnection}
				/>

		</div>

		{/*  gap-6 */}
		<div className="mt-6 bg-white rounded grid grid-cols-2">

			<div className="p-6">
				<h2 className="text-xl font-semibold">Inspect connection</h2>
				{(selectedConnection)
					? <InspectConnection
							key={selectedConnection.sessionId}
							client={client}
							connection={selectedConnection}
							setSelectedConnection={setSelectedConnection}
							/>
					: <p><em>(Please select an active client connection)</em></p>}
			</div>

			<div className="p-6 text-sm">
				<h2 className="text-xl font-semibold mb-2">State</h2>
				{(selectedConnection)
					? <StateView key={selectedConnection.sessionId} connection={selectedConnection} />
					: <p><em>(Please select an active client connection)</em></p>}
			</div>

		</div>
	</>;
}