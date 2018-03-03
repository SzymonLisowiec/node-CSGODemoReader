const ProtoBuf = require(__dirname + '/../src/Protobuf');
let proto = new ProtoBuf();

proto.require(__dirname + '/Common', 'Common');
proto.require(__dirname + '/GCMessages', 'GCMessages');
proto.require(__dirname + '/NetMessages', 'NetMessages');
proto.require(__dirname + '/UserMessages', 'UserMessages');

module.exports = proto;