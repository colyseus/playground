import { Client, Room } from "colyseus.js";
import { useEffect, useState } from "react";
import { Connection, allRoomColors, getRoomColorClass, roomsBySessionId } from "../utils/Types";

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

	const allowSelection = (connection.error === undefined);

	return <div
		className={"w-full p-2 text-sm rounded " + (
			(isSelected)
				? "bg-purple-600"
				: (allowSelection)
					? "hover:bg-purple-100 cursor-pointer"
					: ""
		)}
		onClick={(isSelected || !allowSelection) ? undefined : handleClick}
	>
		{(connection.error)
			? <>
				<span className="mr-1 font-semibold bg-red-500 text-white text-xs rounded p-1">FAILED</span>
				<span className="text-red-500"><strong>Error:</strong> {connection.error}</span>

			</>
			: <>
				{(connection.isConnected)
					? <span className="font-semibold bg-green-500 text-white text-xs rounded p-1">OPEN</span>
					: <span className="font-semibold bg-red-500 text-white text-xs rounded p-1">CLOSED</span>}

				<span className="ml-2 bg-orange-500 p-1 rounded text-white font-semibold">{room.name}</span>
				<code className="ml-2 bg-gray-100 p-1 rounded">sessionId: {connection.sessionId}</code>
				<code className={getRoomColorClass(room.roomId) + " text-white ml-2 p-1 rounded"}>roomId: {room.roomId}</code>
			</>}

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

	return (
		<div className="bg-white rounded p-6">
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
		</div>
	);
}