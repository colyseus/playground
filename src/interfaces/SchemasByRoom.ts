export interface MessageSchemas {
    client?: object,
    server?: object
}

export interface MessageSchemasByType {
    [type: string]: MessageSchemas
}

export interface MessageSchemasByRoom {
    [roomName: string]: MessageSchemasByType
}
