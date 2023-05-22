import { Client } from "colyseus.js";
import { useState } from "react";

import { matchmakeMethods } from "../utils/Types";

export function JoinRoomForm ({
	roomNames,
	createClientConnection,
} : {
	roomNames: string[]
	createClientConnection: (method: keyof Client, roomName: string, options: string) => void
}) {
	const [selectedRoomName, setRoomName] = useState(roomNames[0]);
	const [selectedMethod, setMethod] = useState(Object.keys(matchmakeMethods)[0] as keyof Client);
	const [options, setOptions] = useState("{}");

	const handleSelectedRoomChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		setRoomName(e.target.value);

	const handleSelectedMethodChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		setMethod(e.target.value as keyof Client);

	const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
		setOptions(e.target.value);

	const onJoinClick = () =>
		createClientConnection(selectedMethod, selectedRoomName, options);

	return (<>
		<h2 className="text-xl font-semibold">Join a room</h2>

		<p className="mt-2"><strong>Available room types:</strong></p>
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
						<label htmlFor={"name_" + roomName} className="ml-2 text-sm font-medium text-gray-900"><code className="bg-gray-100 p-1">{roomName}</code></label>
				</div>
			))}
		</div>

		<p className="mt-2"><strong>Method</strong></p>
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

		<p className="mt-2"><strong>Join options</strong></p>
		<div className="flex mt-2">
			<textarea name="options" id="options" className="border border-gray-300 w-80 font-mono p-1.5 rounded" rows={1} onChange={handleOptionsChange} value={options} />
		</div>

		<div className="flex mt-4">
			<button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" onClick={onJoinClick}>
				{matchmakeMethods[selectedMethod]}
			</button>
		</div>
	</>);
}
