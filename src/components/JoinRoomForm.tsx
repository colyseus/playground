import { Client, Room } from "colyseus.js";
import { useState } from "react";
import { client, endpoint, roomsBySessionId, messageTypesByRoom, Connection, matchmakeMethods, getRoomColorClass } from "../utils/Types";
import { RAW_EVENTS_KEY } from "../utils/ColyseusSDKExt";

export function JoinRoomForm ({
	roomNames,
	onConnectionSuccessful,
	onDisconnection,
} : {
	roomNames: string[]
	onConnectionSuccessful: (connection: Connection) => void
	onDisconnection: (sessionId: string) => void
}) {
	const [selectedRoomName, setRoomName] = useState(roomNames[0]);
	const [selectedRoomId, setRoomId] = useState(""); // only for joinById
	const [selectedMethod, setMethod] = useState(Object.keys(matchmakeMethods)[0] as keyof Client);
	const [options, setOptions] = useState("{}");
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// remote stats
	const [roomCount, setRoomCount] = useState({} as {[key: string]: number});
	const [roomsById, setRoomsById] = useState({} as {[key: string]: {name: string, metadata: any}});

	const handleSelectedRoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (selectedMethod === "joinById") {
			setRoomId(e.target.value);
		} else {
			setRoomName(e.target.value);
		}
	}

	const handleSelectedMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const method = e.target.value as keyof Client;
		setMethod(method);

		// fetch rooms by ID
		if (method === "joinById") {
			fetch(`${endpoint}/playground/rooms_by_id`).
				then((response) => response.json()).
				then((rooms) => setRoomsById(rooms)).
				catch((e) => console.error(e));
		}
	}

	const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
		setOptions(e.target.value);

	const onJoinClick = () =>
		createClientConnection(selectedMethod, (selectedMethod === "joinById") ? selectedRoomId : selectedRoomName, options);

	// create new connection to server
	const createClientConnection = async (method: keyof Client, roomName: string, options: string) => {
		setError(""); // clear previous error
		setLoading(true);
		try {
			const room = (await client[method](roomName, JSON.parse(options))) as Room;
			roomsBySessionId[room.sessionId] = room;

			const connection: Connection = {
				sessionId: room.sessionId,
				isConnected: true,
				messages: [],
				events: (room as any)[RAW_EVENTS_KEY].map((data: any) => ({ // consume raw events from ColyseusSDKExt
					type: data[0],
					message: data[1],
					in: true,
					now: data[2]
				})),
				error: undefined,
			};

			room.onMessage(RAW_EVENTS_KEY, (data) => {
				connection.events.unshift({
					type: data[0],
					message: data[1],
					in: true,
					now: new Date()
				});
			});

			// prepend received messages
			room.onMessage("*", (type, message) => {
				const now = new Date();
				connection.messages.unshift({ type, message, in: true, now })
			});

			room.onLeave((code) => {
				onDisconnection(room.sessionId);
			});

			room.onError((code, message) => {
				// connection.events.push({ type: "error", message: { code, message }, now: new Date() });
			});

			room.onMessage("__playground_message_types", (types) => {
				// global message types by room name
				messageTypesByRoom[room.name] = types;

				// append connection to connections list
				onConnectionSuccessful(connection);

				// fetch room count immediatelly after joining
				fetch(`${endpoint}/playground/stats`).
					then((response) => response.json()).
					then((stats) => setRoomCount(stats)).
					catch((e) => console.error(e));
			});

		} catch (e: any) {
			const error = e.target?.statusText || e.message || "server is down.";
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	return (<>
		<h2 className="text-xl font-semibold">Join a room</h2>

		<p className="mt-4"><strong>Method</strong></p>
		<div className="flex mt-2">
			{Object.keys(matchmakeMethods).map((method) => (
			<div key={method} className="flex items-center mr-4">
					<input id={method}
						type="radio"
						name="method"
						value={method}
						checked={selectedMethod === method}
						onChange={handleSelectedMethodChange}
						className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2" />
					<label htmlFor={method} className="ml-2 text-sm font-medium text-gray-900">{matchmakeMethods[method]}</label>
			</div>
			))}
		</div>

		{(selectedMethod !== "joinById")
			? // NOT joinById
			<>
				<p className="mt-4"><strong>Available room types:</strong></p>
				<div className="flex mt-2 flex-wrap">

					{/* No room definitions found */}
					{(roomNames.length) === 0 &&
						<p>Your server does not define any room type. See <a href="https://docs.colyseus.io/server/api/#define-roomname-string-room-room-options-any">documentation</a>.</p>}

					{/* List room definitions */}
					{(roomNames).map((roomName) => (
						<div key={roomName} className="flex items-center mr-4 mb-2">
								<input id={"name_" + roomName}
									name="room_name"
									type="radio"
									value={roomName}
									checked={selectedRoomName === roomName}
									onChange={handleSelectedRoomChange}
									className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2" />
								<label htmlFor={"name_" + roomName} className="ml-2 text-sm font-medium text-gray-900">
									<code className="bg-gray-100 p-1">{roomName}</code>
									{(roomCount[roomName] !== undefined) &&
										<span className="group relative ml-1 text-sm text-gray-500 cursor-help">
											({roomCount[roomName]})
											<span className="absolute left-8 w-32 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">{roomCount[roomName] + " active room(s)"}</span>
										</span>}

								</label>
						</div>
					))}
				</div>
			</>

		: // joinById
			<>
				<p className="mt-4"><strong>Available rooms by ID:</strong></p>
				<div className="flex mt-2 flex-wrap">

					{/* No room definitions found */}
					{(Object.keys(roomsById).length) === 0 &&
						<p><em>No rooms available.</em></p>}

					{/* List room definitions */}
					{(Object.keys(roomsById)).map((roomId) => (
						<div key={roomId} className="flex items-center mr-4 mb-2">
								<input id={"roomid_" + roomId}
									name="room_id"
									type="radio"
									value={roomId}
									checked={selectedRoomId === roomId}
									onChange={handleSelectedRoomChange}
									className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2" />
								<label htmlFor={"roomid_" + roomId} className="ml-2 text-sm font-medium text-gray-900">
									<code className={"p-1 rounded text-white " + getRoomColorClass(roomId)}>{roomId}</code>
									<span className="relative ml-1 text-sm text-gray-500">
										({roomsById[roomId].name})
									</span>
								</label>
						</div>
					))}
				</div>
			</>
		}

		<p className="mt-4"><strong>Join options</strong></p>
		<div className="flex mt-2">
			<textarea name="options" id="options" className="border border-gray-300 w-80 font-mono p-1.5 rounded" rows={1} onChange={handleOptionsChange} value={options} />
		</div>

		<div className="flex mt-4">
			<button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" onClick={onJoinClick}>
				{matchmakeMethods[selectedMethod]}
			</button>
			<div className="ml-1 p-2 inline italic">
				{isLoading && "Connecting..."}
				{!isLoading && error &&
					<span className="text-red-500"><strong>Error:</strong> {error}</span>}
			</div>
		</div>
	</>);
}
