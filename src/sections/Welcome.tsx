import { Client, Room } from "colyseus.js";
import { useEffect, useState } from "react";

const methods: {[key: string]: string} = {
	"joinOrCreate": "Join or Create",
	"create": "Create",
	"join": "Join",
	"joinById": "Join by ID",
};

const endpoint = "http://localhost:2567";
const client = new Client(endpoint);

export function Welcome() {
	const [roomNames, setRoomNames] = useState([]);
	const [selectedRoomName, setRoomName] = useState("");
	const [selectedMethod, setMethod] = useState(Object.keys(methods)[0] as keyof Client);
	const [options, setOptions] = useState("{}");
	const [connections, setConnections] = useState([] as Room[]);


	const handleSelectedRoomChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setRoomName(e.target.value);

	const handleSelectedMethodChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMethod(e.target.value as keyof Client);

	const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setOptions(e.target.value);

	const createClientConnection = async () => {
		const connection = (await client[selectedMethod](selectedRoomName, JSON.parse(options))) as Room;
		connection.onMessage("*", (type, message) => console.log(type, message));
		connection.onLeave(() => { });
		connection.onError((code, message) => { });
		setConnections([...connections, connection]);
	};

	// fetch rooms on mount
	useEffect(() => {
		fetch(`${endpoint}/playground/rooms`).
			then((response) => response.json()).
			then((rooms) => {
				setRoomName(rooms[0]);
				setRoomNames(rooms);
			}).
			catch((e) => console.error(e));
	}, []);

	return <>
		<div className="bg-white rounded p-6 mt-14">

			<h2 className="text-xl font-semibold">Join a room</h2>

			<p className="mt-2"><strong>Available room types:</strong></p>
			<div className="flex mt-2">
				{(roomNames).map((roomName) => (
					<div key={roomName} className="flex items-center mr-4">
							<input id={"name_" + roomName}
								name="room_name"
								type="radio"
								value={roomName}
								checked={selectedRoomName === roomName}
								onChange={handleSelectedRoomChange}
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2" />
							<label htmlFor={"name_" + roomName} className="ml-2 text-sm font-medium text-gray-900"><code className="bg-gray-100 p-1">{roomName}</code></label>
					</div>
				))}
			</div>

			<p className="mt-2"><strong>Method</strong></p>
			<div className="flex mt-2">
				{Object.keys(methods).map((method) => (
				<div key={method} className="flex items-center mr-4">
						<input id={method}
							type="radio"
							name="method"
							value={method}
							checked={selectedMethod === method}
							onChange={handleSelectedMethodChange}
							className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2" />
						<label htmlFor={method} className="ml-2 text-sm font-medium text-gray-900">{methods[method]}</label>
				</div>
				))}
			</div>

			<p className="mt-2"><strong>Join options</strong></p>
			<div className="flex mt-2">
				<textarea name="options" id="options" rows={3} onChange={handleOptionsChange} className="border border-gray-300 w-80 font-mono">{options}</textarea>
			</div>

			<div className="flex mt-4">
				<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={createClientConnection}>Join</button>
			</div>

		</div>

		<div className="mt-6 grid grid-cols-2 gap-6">
			<div className="bg-white rounded p-6">
				<h2 className="text-xl font-semibold">Client connections</h2>

				{(connections.length === 0)
					? <p><em>No active client connections.</em></p>
					: connections.map((connection) => (
						<div key={connection.sessionId}>
							<span className="text-xs block">Client connection:</span>

							<code className="bg-gray-100 p-1 text-sm rounded">sessionId: {connection.sessionId}</code> ·
							<code className="bg-gray-100 p-1 text-sm rounded">roomId: {connection.roomId}</code>
						</div>
					))}

			</div>

			<div className="bg-white rounded p-6">
				<h2 className="text-xl font-semibold">Inspect connection</h2>
				<p><em>(Please select an active client connection)</em></p>
			</div>
		</div>
	</>;
}