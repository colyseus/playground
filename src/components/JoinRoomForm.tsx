import { Client, Room } from "colyseus.js";
import { useState } from "react";
import { global, client, endpoint, roomsBySessionId, messageTypesByRoom, Connection, matchmakeMethods, getRoomColorClass } from "../utils/Types";
import { DEVMODE_RESTART, RAW_EVENTS_KEY, onRoomConnected } from "../utils/ColyseusSDKExt";
import { LimitedArray } from "../utils/LimitedArray";
import { JSONEditor } from "../elements/JSONEditor";
import * as JSONEditorModule from "jsoneditor";
import { RoomWithId } from "../elements/RoomWithId";

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
	const [optionsText, setOptionsJSON] = useState("{}");
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isButtonEnabled, setButtonEnabled] = useState(true);

	// remote stats
	const [roomCount, setRoomCount] = useState({} as {[key: string]: number});
	const [roomsById, setRoomsById] = useState({} as {[key: string]: {name: string, metadata: any}});

	// get room name / room count
	const fetchRoomStats = () => {
		fetch(`${endpoint}/playground/stats`).
			then((response) => response.json()).
			then((stats) => setRoomCount(stats)).
			catch((e) => console.error(e));
	}

	const onChangeOptions = (json: any) => setOptionsJSON(json);

	const handleSelectedRoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (selectedMethod === "joinById") {
			setRoomId(e.target.value);
		} else {
			setRoomName(e.target.value);
		}
	}

	const onOptionsValidationError = (errors: ReadonlyArray<JSONEditorModule.SchemaValidationError | JSONEditorModule.ParseError>) => {
		setButtonEnabled(errors.length === 0);
		// setError(error);
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

		} else {
			setButtonEnabled(true);
		}
	}

	const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
		setOptionsJSON(e.target.value);

	const onJoinClick = async () => {
		const method = selectedMethod;
		const roomName = (method === "joinById") ? selectedRoomId : selectedRoomName;

		setError(""); // clear previous error
		setLoading(true);

		try {
			await client[method](roomName, JSON.parse(optionsText || "{}"));

		} catch (e: any) {
			const error = e.target?.statusText || e.message || "server is down.";
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	// handle new connections
	onRoomConnected((room: Room) => {
		// TODO: clean up old connections
		roomsBySessionId[room.sessionId] = room;

		const existingConnection = global.connections.find((c) => c.sessionId === room.sessionId);

		// FIXME: why .reconnect() doesn't re-use the events?
		const needRebindEvents = existingConnection && Object.keys(room['onMessageHandlers'].events).length === 0;

		// skip if reconnecting on devMode (previous room events are successfuly re-used.)
		// when using .reconnect() events need to be bound again
		if (existingConnection && !needRebindEvents) {
			return;
		}

		// get existing Connection for sessionId, or create a new one
		const connection: Connection = existingConnection || {
			sessionId: room.sessionId,
			isConnected: true,
			messages: new LimitedArray(),
			events: new LimitedArray(...(room as any)[RAW_EVENTS_KEY].map((data: any) => ({ // consume initial raw events from ColyseusSDKExt
				eventType: data[0],
				type: data[1],
				message: data[2],
				now: data[3]
			})))
		};

		// prepend received messages
		room.onMessage("*", (type, message) => {
			connection.messages.unshift({
				type,
				message,
				in: true,
				now: new Date()
			})
		});

		room.onLeave((code) => onDisconnection(room.sessionId));

		// devmode restart event
		room.onMessage(DEVMODE_RESTART, (data: any[]) => onDisconnection(room.sessionId));

		// raw events from SDK
		room.onMessage(RAW_EVENTS_KEY, (data: any[]) => {
			// FIXME: React is not updating the view when pushing to array
			connection.events.unshift({
				eventType: data[0],
				type: data[1],
				message: data[2],
				now: new Date(),
			});
		});

		room.onMessage("__playground_message_types", (types) => {
			// global message types by room name
			messageTypesByRoom[room.name] = types;

			// append connection to connections list
			onConnectionSuccessful(connection);

			// fetch room count immediatelly after joining
			fetchRoomStats();
		});
	});

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
								<label htmlFor={"name_" + roomName} className="ml-2 text-sm font-medium text-gray-900 cursor-pointer hover:opacity-80 transition">
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
								<label htmlFor={"roomid_" + roomId} className="cursor-pointer hover:opacity-80 transition">
									<RoomWithId name={roomsById[roomId].name} roomId={roomId} />
								</label>
						</div>
					))}
				</div>
			</>
		}

		{/* Do not show "join options" if joining by room ID AND no room is available. */}
		{(selectedMethod === "joinById" && Object.keys(roomsById).length === 0)
			? null
			: <>
				<p className="mt-4"><strong>Join options</strong></p>
				<JSONEditor
					text={optionsText}
					onChangeText={onChangeOptions}
					onValidationError={onOptionsValidationError}
					mode="code"
					search={false}
					statusBar={false}
					navigationBar={false}
					mainMenuBar={false}
					className={"mt-2 h-24 overflow-hidden rounded border " + (isButtonEnabled ? "border-gray-300" : "border-red-300")}
				/>

				<div className="flex mt-4">
					<button
						className="bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
						onClick={onJoinClick}
						disabled={!isButtonEnabled}>
						{matchmakeMethods[selectedMethod]}
					</button>
					<div className="ml-1 p-2 inline italic">
						{isLoading && "Connecting..."}
						{!isLoading && error &&
							<span className="text-red-500"><strong>Error:</strong> {error}</span>}
					</div>
				</div>
			</>}

	</>);
}
