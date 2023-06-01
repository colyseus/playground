import { Client, Room } from "colyseus.js";
import { useEffect, useState } from "react";
import { Connection, allRoomColors, getRoomColorClass, roomsBySessionId } from "../utils/Types";
import { RoomWithId } from "../elements/RoomWithId";

function ConnectionItem({
	connection,
	isSelected,
	onClick,
}: {
	connection: Connection,
	isSelected: boolean,
	onClick: (connection: Connection) => void,
}) {
	const room = roomsBySessionId[connection.sessionId];
	const handleClick = () => onClick(connection);

	return <div
		className={"w-full p-2 text-sm rounded text-gray-500" + (
			(!connection.isConnected)
				? (isSelected) ? " bg-red-500" :  " bg-red-100"
				: " "
		) + (
			(isSelected)
				? " bg-green-500 text-white"
				: " hover:bg-gray-100 cursor-pointer"
		)}
		onClick={(isSelected) ? undefined : handleClick}
	>
		<RoomWithId name={room.name} roomId={room.roomId} />

		{(connection.isConnected)
			? <span className="ml-2 font-semibold bg-green-500 text-white rounded p-1">↔</span>
			: <span className="ml-2 font-semibold bg-red-500 text-white rounded p-1">🅧</span>}

		<code className="ml-2 bg-gray-100 text-gray-700 p-1 rounded">sessionId: {connection.sessionId}</code>
	</div>
}

export function ConnectionList({
	connections,
	selectedConnection,
	setSelectedConnection,
} : {
	connections: Connection[],
	selectedConnection: Connection,
	setSelectedConnection: (connection: Connection) => void,
}) {

	const onClick = (connection: Connection) =>
		setSelectedConnection(connection)

	return (<>
		<h2 className="text-xl font-semibold mb-2">Client connections</h2>

		{/* Workaround to emit CSS for all available colors */}
		<span className="bg-lime-800 bg-green-800 bg-emerald-800 bg-teal-800 bg-cyan-800 bg-sky-800 bg-blue-800 bg-indigo-800 bg-violet-800 bg-fuchsia-800 bg-pink-800 bg-rose-800"></span>

		{(connections.length === 0)
			? <p><em>No active client connections.</em></p>
			: connections.map((connection, i) =>
				<ConnectionItem
					key={connection.sessionId || i.toString()}
					connection={connection}
					isSelected={connection === selectedConnection}
					onClick={onClick} />
			)}
	</>);
}