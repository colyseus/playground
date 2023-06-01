import { getRoomColorClass } from "../utils/Types";

export function RoomWithId({ name, roomId }: { name: string, roomId: string }) {
	return <span className={getRoomColorClass(roomId) + " p-1.5 rounded text-xs text-white"}>
		{name}
		<code className="ml-2 text-xs bg-gray-100 p-0.5 text-gray-700 rounded">
			<span className="ml-1 ">{roomId}</span>
		</code>
	</span>;
}