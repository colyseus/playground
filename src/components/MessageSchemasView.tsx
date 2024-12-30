import React from 'react';
import { messageSchemasByRoom } from '../utils/Types';
import JsonView from 'react18-json-view';
import { MessageSchemas } from '../interfaces/SchemasByRoom';

export function MessageSchemasView({ 
    roomName, 
    messageSchemas 
}: { 
    roomName: string, 
    messageSchemas: MessageSchemas | undefined 
}) {
    if (!messageSchemasByRoom[roomName]) {
        return <p>No schema information available.</p>;
    }

    const renderSchema = (schema: object | undefined): JSX.Element => {
        if (!schema) return <p>No schema available for this message type.</p>;

        return (
            <div className="bg-white p-2 rounded border border-gray-200 shadow-sm">
                <JsonView 
                    src={schema} 
                    enableClipboard={false}
                />
            </div>
        );
    };

    return (
        <div>
            <table className="table-fixed w-full border-collapse text-xs border-t border-l border-r">
                <thead>
                    <tr className="border-b">
                        <th scope="col" className="w-1/2 px-6 py-3 border-r">Client's Message</th>
                        <th scope="col" className="w-1/2 px-6 py-3">Server's Message</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-white border-b">
                        <td className="px-6 py-4 border-r align-top">
                            {renderSchema(messageSchemas?.client)}
                        </td>
                        <td className="px-6 py-4 align-top">
                            {renderSchema(messageSchemas?.server)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
