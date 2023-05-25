import { Client, Room } from "colyseus.js";
import { useEffect, useState } from "react";

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
	const [roomNames, setRoomNames] = useState([]);
	const [connections, setConnections] = useState([] as Connection[]);
	const [selectedConnection, setSelectedConnection] = useState(undefined as unknown as Connection);

	const onConnectionSuccessful = (connection: Connection) => {
		if (global.connections.indexOf(connection) !== -1) {
			// reconnected! (via devMode or .reconnect())
			connection.isConnected = true;
			setConnections(global.connections);

		} else {
			// new connection
			global.connections = [connection, ...global.connections];
			setConnections(global.connections);

			// auto-select connection
			if (!selectedConnection || !selectedConnection.isConnected) {
				setSelectedConnection(connection);
			}
		}
	}

	const onDisconnection = function (sessionId: string) {
		const connection = global.connections.find((connection) => connection.sessionId === sessionId);
		connection!.isConnected = false;
		setConnections([...global.connections]);
	}

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
		<div className="grid grid-cols-2 gap-6">

			<div className="bg-white shadow rounded p-6">
				{(serverState === ServerState.CONNECTING) && <p>Connecting to server...</p>}
				{(serverState === ServerState.OFFLINE) && <p>Server is offline.</p>}
				{(serverState === ServerState.CONNECTED) &&
					<JoinRoomForm
						roomNames={roomNames}
						onConnectionSuccessful={onConnectionSuccessful}
						onDisconnection={onDisconnection}
					/>}
			</div>

			<div className="bg-white shadow rounded p-6">
				<ConnectionList
					connections={connections}
					selectedConnection={selectedConnection}
					setSelectedConnection={setSelectedConnection}
					/>
			</div>

		</div>

		{/*  gap-6 */}
		<div className="mt-6 bg-white shadow rounded grid grid-cols-2 min-h-screen">

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