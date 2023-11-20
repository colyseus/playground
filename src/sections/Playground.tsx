import { useEffect, useState } from "react";
import { RoomAvailable } from "colyseus.js";

import { InspectConnection } from "../components/InspectConnection";
import { client, endpoint, Connection, global } from "../utils/Types";
import { ConnectionList } from "../components/ConnectionList";
import { JoinRoomForm } from "../components/JoinRoomForm";
import { StateView } from "../components/StateView";

enum ServerState {
	CONNECTING = "connecting",
	CONNECTED = "connected",
	OFFLINE = "offline",
}

export function Playground() {
	const [serverState, setServerState] = useState(ServerState.CONNECTING);
	const [connections, setConnections] = useState([] as Connection[]);
	const [selectedConnection, setSelectedConnection] = useState(undefined as unknown as Connection);

	// remote stats
	const [roomNames, setRoomNames] = useState([]);
	const [roomsById, setRoomsById] = useState({} as { [key: string]: RoomAvailable & { locked: boolean } });
	const [roomsByType, setRoomsByType] = useState({} as {[key: string]: number});

	const onConnectionSuccessful = (connection: Connection) => {
		if (global.connections.indexOf(connection) !== -1) {
			// reconnected! (via devMode or .reconnect())
			connection.isConnected = true;
			setConnections([...global.connections]);

		} else {
			// new connection
			global.connections = [connection, ...global.connections];
			setConnections(global.connections);

			// auto-select connection
			if (!selectedConnection || !selectedConnection.isConnected) {
				setSelectedConnection(connection);
			}
		}

		// fetch room count immediatelly after joining
		fetchRoomStats();
	}

	const onDisconnection = function (sessionId: string) {
		const connection = global.connections.find((connection) => connection.sessionId === sessionId);
		// when using "leave all + clear" connection won't exist anymore
		if (connection) {
			connection!.isConnected = false;
			setConnections([...global.connections]);
			fetchRoomStats();
		}
	}

	const clearConnections = () => {
		global.connections = [];
		fetchRoomStats();
		setConnections(global.connections);
		setSelectedConnection(undefined as unknown as Connection);
	}

	// get room name / room count
	const fetchRoomStats = () => {
		fetch(`${endpoint}/rooms`).
			then((response) => response.json()).
			then((stats) => {
				setServerState(ServerState.CONNECTED);
				setRoomNames(stats.rooms);
				setRoomsByType(stats.roomsByType);
				setRoomsById(stats.roomsById);
			}).
			catch((e) => {
				setServerState(ServerState.OFFLINE);
				console.error(e)
			});
	}

	// fetch available room types on mount
	// FIXME: why is useEffect being called twice?
	useEffect(() => {
		fetchRoomStats();

		const retryWhenOfflineInterval = window.setInterval(() => {
			if (serverState === ServerState.OFFLINE) { fetchRoomStats(); }
		}, 1000);

		return () => window.clearInterval(retryWhenOfflineInterval);
	}, []);

	return <>
		<div className="grid grid-cols-2 gap-6">

			<div className="bg-white shadow rounded p-6">
				{(serverState === ServerState.CONNECTING) && <p>Connecting to server...</p>}
				{(serverState === ServerState.OFFLINE) && <p>Server is offline.</p>}
				{(serverState === ServerState.CONNECTED) &&
					<JoinRoomForm
						roomNames={roomNames}
						roomsByType={roomsByType}
						roomsById={roomsById}
						onConnectionSuccessful={onConnectionSuccessful}
						onDisconnection={onDisconnection}
					/>}
			</div>

			<div className="bg-white shadow rounded p-6">
				<ConnectionList
					connections={connections}
					selectedConnection={selectedConnection}
					clearConnections={clearConnections}
					setSelectedConnection={setSelectedConnection}
					/>
			</div>

		</div>

		{/*  gap-6 */}
		<div className="mt-6 bg-white shadow rounded grid grid-cols-2 min-h-screen">

			<div className="p-6">
				<h2 className="text-xl font-semibold">
					Inspect connection
					{(selectedConnection)
						? <span> (<code className="bg-gray-100 text-sm text-gray-700 p-1 rounded">sessionId: {selectedConnection.sessionId}</code>)</span>
						: null}

				</h2>
				{(selectedConnection)
					? <InspectConnection
							key={selectedConnection.sessionId}
							client={client}
							connection={selectedConnection} />
					: <p><em>(Please select an active client connection)</em></p>}
			</div>

			<div className="p-6">
				<h2 className="text-xl font-semibold mb-2">State</h2>
				{(selectedConnection)
					? <div className="text-sm">
							<StateView key={selectedConnection.sessionId} connection={selectedConnection} />
						</div>
					: <p><em>(Please select an active client connection)</em></p>}
			</div>

		</div>
	</>;
}
