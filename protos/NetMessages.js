const MSG = require(__dirname + '/../enums/NetMessages');

let Messages = {};
module.exports = Messages;

Messages[MSG.ServerInfo] = {
	fields: [
		[1, 'protocol', 'varInt32'],
		[2, 'serverCount', 'varInt32'],
		[3, 'isDedicated', 'varInt32Bool'],
		[4, 'isOfficialValveServer', 'varInt32Bool'],
		[5, 'isHLTV', 'varInt32Bool'],
		[6, 'isReplay', 'varInt32Bool'],
		[7, 'cOs', 'varInt32'],
		[8, 'mapCrc', 'int32'],
		[9, 'clientCrc', 'int32'],
		[10, 'stringTableCrc', 'int32'],
		[11, 'maxClients', 'varInt32'],
		[12, 'maxClasses', 'varInt32'],
		[13, 'playerSlot', 'varInt32'],
		[14, 'tickInterval', 'float'],
		[15, 'gameDirectory', 'vString'],
		[16, 'mapName', 'vString'],
		[17, 'mapGroupName', 'vString'],
		[18, 'skyName', 'vString'],
		[19, 'hostName', 'vString'],
		[21, 'isRedirectingToProxyRelay', 'varInt32Bool'],
		[22, 'ugcMapId', 'bytes', [8]]
	]
};

Messages[MSG.SendTable] = {
	messages: {
		sendprop_t: {
			messages: {},
			fields: [
				[1, 'type', 'varInt32'],
				[2, 'varName', 'vString'],
				[3, 'flags', 'varInt32'],
				[4, 'priority', 'varInt32'],
				[5, 'dataTableName', 'vString'],
				[6, 'numElements', 'varInt32'],
				[7, 'lowValue', 'float'],
				[8, 'highValue', 'float'],
				[9, 'numBits', 'varInt32']
			]
		}
	},
	fields: [
		[1, 'isEnd', 'varInt32Bool'],
		[2, 'netTableName', 'vString'],
		[3, 'needsDecoder', 'varInt32Bool'],
		[4, 'props', 'sendprop_t', null, 'array']
	]
};

Messages[MSG.CreateStringTable] = {
	fields: [
		[1, 'name', 'vString'],
		[2, 'maxEntries', 'varInt32'],
		[3, 'numEntries', 'varInt32'],
		[4, 'userDataFixedSize', 'varInt32Bool'],
		[5, 'userDataSize', 'varInt32'],
		[6, 'userDataSizeBits', 'varInt32'],
		[7, 'flags', 'varInt32'],
		[8, 'data', 'vChunk']
	]
};

Messages[MSG.UpdateStringTable] = {
	fields: [
		[1, 'tableId', 'varInt32'],
		[2, 'numChangedEntries', 'varInt32'],
		[3, 'data', 'vChunk']
	]
};

Messages[MSG.PacketEntities] = {
	fields: [
		[1, 'maxEntities', 'varInt32'],
		[2, 'updatedEntities', 'varInt32'],
		[3, 'isDelta', 'varInt32Bool'],
		[4, 'updateBaseline', 'varInt32Bool'],
		[5, 'baseline', 'varInt32'],
		[6, 'deltaFrom', 'varInt32'],
		[7, 'entityData', 'vChunk']
	]
};

Messages[MSG.UserMessage] = {
	fields: [
		[1, 'userMessageType', 'varInt32'],
		[2, 'data', 'vChunk']
	]
};

Messages[MSG.GameEvent] = {
	messages: {
		key_t: {
			messages: {},
			fields: [
				[1, 'type', 'varInt32'],
				[2, 'value', 'vString'],
				[3, 'value', 'float'],
				[4, 'value', 'varInt32'],
				[5, 'value', 'varInt32'],
				[6, 'value', 'varInt32'],
				[7, 'value', 'varInt32Bool'],
				[8, 'value', 'varInt64'],
				[9, 'value', 'vChunk']
			]
		}
	},
	fields: [
		[1, 'eventName', 'vString'],
		[2, 'eventId', 'varInt32'],
		[3, 'values', 'key_t', null, 'array']
	]
};

Messages[MSG.GameEventList] = {
	messages: {
		descriptor_t: {
			messages: {
				key_t: {
					messages: {},
					fields: [
						[1, 'type', 'varInt32'],
						[2, 'name', 'vString']
					]
				}
			},
			fields: [
				[1, 'eventId', 'varInt32'],
				[2, 'name', 'vString'],
				[3, 'keys', 'key_t', null, 'array']
			]
		}
	},
	fields: [
		[1, 'descriptors', 'descriptor_t', null, 'array']
	]
};