const EventEmitter = require('events');
const BitStream = require(__dirname + '/BitStream');
const Entity = require(__dirname + '/Entities/Entity');

const Protos = require(__dirname + '/../protos/');
let NetMessages = require(__dirname + '/../enums/NetMessages');
let Commands = require(__dirname + '/../enums/Commands');
let PacketEntities = require(__dirname + '/../enums/PacketEntities');
let UserMessages = require(__dirname + '/../enums/UserMessages');

const EntitiesMap ={
	Player: require(__dirname + '/Entities/Player'),
	Team: require(__dirname + '/Entities/Team'),
	DecoyGrenade: require(__dirname + '/Entities/DecoyGrenade'),
	Flashbang: require(__dirname + '/Entities/Flashbang'),
	HEGrenade: require(__dirname + '/Entities/HEGrenade'),
	Grenade: require(__dirname + '/Entities/Grenade'),
	MolotovGrenade: require(__dirname + '/Entities/MolotovGrenade'),
	SmokeGrenade: require(__dirname + '/Entities/SmokeGrenade'),
	Weapon: require(__dirname + '/Entities/Weapon')
}

class Demo extends EventEmitter {

	constructor (buffer){
		super(buffer);

		this.stream = new BitStream(buffer);

		this.match ={
			round: -1
		};
		this.commandHandlers = [];
		this.serverClasses = [];
		this.players = [];
		this.entities = [];
		this.serverClassesLoaded = false;
		this.classCachePath = null;
		this.dataTables = null;
		this.stringTables = [];
		this.gameEventDescriptors = [];
		this.tick = 0;
	}
	
	run () {

		this.running = 2;

		let demo_header = {
			'filestamp': this.stream.string(8),
			'demo_protocol': this.stream.int32(),
			'network_protocol': this.stream.int32(),
			'server_name': this.stream.string(260),
			'client_name': this.stream.string(260),
			'map_name': this.stream.string(260),
			'game_directory': this.stream.string(260),
			'playback_time': this.stream.float(),
			'playback_ticks': this.stream.int32(),
			'playback_frames': this.stream.int32(),
			'signOnLength': this.stream.int32()
		};
		
		while(this.running){

			let command = this.stream.byte();
			if (command === undefined){
				this.running = false;
				this.emit('end');
			}

			let tick = this.stream.int32();
			this.tick = tick;
			
			if(command != Commands.PACKET){
				this.tick = 0;
			}
			if(this.tick > 0){
				this.emit('tick', this.tick);
			}
			
			this.stream.skip(1);

			switch(command){

				case Commands.SIGNON:
				case Commands.PACKET:
					this.parsePacket();
					break;

				case Commands.DATA_TABLES:
					this.parseDataTables();
					break;

				case Commands.USER_CMD:
					this.stream.skip(4);
					this.stream.skip(this.stream.int32());
					break;

				case Commands.STRING_TABLES:
					this.parseStringTables();
					break;

				case Commands.STOP:
					this.running = false;
					this.emit('end');
					break;

				case Commands.CUSTOM:
					this.stream.skip(this.stream.int32());
					break;

				case Commands.CONSOLE_CMD:
					this.stream.skip(this.stream.int32());
					break;

			}

			if(this.tick > 0){
				this.emit('tick_end', this.tick);
			}

		}

	}

	getTick () {
        return this.tick;
    }

	getTeams () {
		return this.getEntities(EntitiesMap.Team);
	}

	getPlayers () {
		return this.getEntities(EntitiesMap.Player);
	}

	getGrenades(){
		return this.getEntities(EntitiesMap.Grenade);
	}
	
	getFlashes(){
		return this.getEntities(EntitiesMap.Flashbang);
	}
	
	getMolotovs(){
		return this.getEntities(EntitiesMap.MolotovGrenade);
	}
	
	getHEGrenades(){
		return this.getEntities(EntitiesMap.HEGrenade);
	}
	
	getSmokeGrenades(){
		return this.getEntities(EntitiesMap.SmokeGrenade);
	}

	getRound () {
		return this.match.round;
	}

	getScores () {
		let scores ={};
		this.getTeams().forEach(team =>{
			
			let team_number = team.getTeamNumber();

			if(team_number)
				scores[team_number] = team.getScore();

		});
		return scores;
	}

	parsePacket () {
		this.stream.skip(160);
		let chunkSize = this.stream.int32();
		let offset = this.stream.tell();

		while(this.stream.tell() < offset + chunkSize){
			
			let message = this.parseProtobufMessage('NetMessages');
			if(message != null){

				switch(message.messageType){
					
					case NetMessages.ServerInfo:
						this.emit('server_info', message);
						break;

					case NetMessages.CreateStringTable:
						if(message.name == 'userinfo'){
							this.parseStringTableUpdate(message.data,
								message.numEntries,
								message.maxEntries,
								message.userDataSize,
								message.userDataSizeBits,
								message.userDataFixedSize);
						}
						this.stringTables.push({
							name: message.name,
							maxEntries: message.maxEntries
						});
						break;

					case NetMessages.UpdateStringTable:
						let stringTable = this.stringTables[message.tableId];
						if(stringTable != null && stringTable.name == 'userinfo' && message.numChangedEntries < stringTable.maxEntries){
							this.parseStringTableUpdate(
								message.data,
								message.numChangedEntries,
								stringTable.maxEntries,
								0, 0, 0, true
							);
						}
						break;

					case NetMessages.PacketEntities:
						this.handlePacketEntities(message);
						break;

					case NetMessages.UserMessage:

						this.emit('user_message', message);
						let msg = Protos.getMessage('UserMessages/' + message.userMessageType);
						
						if(msg){

							msg = msg.decode(message.data);
							this.emit('umsg.' + message.userMessageType, msg);

						}

						break;

					case NetMessages.GameEvent:
						this.handleGameEvent(message);
						break;

					case NetMessages.GameEventList:
						this.handleGameEventsList(message);
						break;

				}

			}
			
		}

	}
	
	parseProtobufMessage (namespace) {

		let messageType = this.stream.varInt32();
		let message = Protos.getMessage((namespace) ? namespace + '/' + messageType : messageType);

		if(message){

			message = message.decode(this.stream);

			if(message){
				message.messageType = messageType;
				return message;
			}

		}else{

			this.stream.skip(this.stream.varInt32());

		}

		return null;
	}
	
	findDataTable (name) {
		for(let j = 0; j < this.dataTables.length; j++){
			if(this.dataTables[j].netTableName == name){
				return this.dataTables[j];
			}
		}
	}

	parseStringTableUpdate (stream, numEntries, maxEntries, userDataSize, userDataSizeBits, userDataFixedSize) {

		let lastEntry = -1;
		let lastDictionaryIndex = -1;
		let nTemp = maxEntries;
		let entryBits = 0;

		while(nTemp >>= 1){
			++entryBits;
		}

		if(stream.bits(1)){
			return;
		}

		let bitDebug = stream.tellBits();

		for(let i = 0; i < numEntries; i++){

			let entryIndex = lastEntry + 1;

			if(!stream.bits(1)){
				entryIndex = stream.bits(entryBits);
			}

			lastEntry = entryIndex;

			if(entryIndex < 0 || entryIndex > maxEntries){
				return;
			}

			let entry = '';
			if(stream.bits(1)){
				if(stream.bits(1)){
					let index = stream.bits(5);
					let bytestocopy = stream.bits(5);
					entry = stream.string(100000, true);
				} else{
					entry = stream.string(100000, true);
				}
			}

			let userData = '';
			let size = 0;

			if(stream.bits(1)){
				if(userDataFixedSize){
					size = userDataSizeBits;
				} else{
					let sizeBytes = stream.bits(14);
					size = sizeBytes * 8;
				}
			}

			let currentBits = stream.tellBits();

			if(size > 0){
				let player = this.readPlayer(stream);
				this.addPlayer(player, entryIndex);
			}

			stream.seekBits(currentBits + size);

		}
	}
	
	parseStringTables () {
		let playerIndex = 0;
		let size = this.stream.int32();
		let destination = this.stream.tell() + size;

		let numTables = this.stream.byte();

		for(let i = 0; i < numTables; i++){

			let tableName = this.stream.string(4096, true);
			let isUserTable = this.tableName == 'userinfo';
			let numStrings = this.stream.int16();

			if(isUserTable){
				//this.players = [];
			}

			for(let j = 0; j < numStrings; j++){

				let string = this.stream.string(4096, true);

				if(this.stream.bits(1)){

					let userDataSize = this.stream.int16();
					let postReadDest = this.stream.tellBits() + (userDataSize * 8);

					if(isUserTable){
						let player = this.readPlayer(this.stream);
						//console.log('adding a player from string table');
						this.addPlayer(player, playerIndex++);
					}
					this.stream.seekBits(postReadDest);
				}
			}
			if(isUserTable) break;
			this.stream.bits(1);
		}

		this.stream.seek(destination);
	}

	parseDataTables () {

		let size = this.stream.int32();
		let destination = this.stream.tell() + size;
		let message = null;
		this.dataTables = [];
		
		while(true){
			message = this.parseProtobufMessage('NetMessages');
			if(message.isEnd){
				break;
			} else{
				this.dataTables.push(message);
			}
		}

		let numServerClasses = this.stream.int16();

		for(let i = 0; i < numServerClasses; i++){

			let serverClass ={
				'classId': this.stream.int16(),
				'name': this.stream.string(256, true),
				'dataTableName': this.stream.string(256, true),
				'flattenedProps': []
			};
			
			serverClass.dataTable = this.findDataTable(serverClass.dataTableName);
			let excludes = this.gatherExcludes(serverClass.dataTable);
			this.gatherProps(serverClass, serverClass.dataTable, excludes);
			this.sortProps(serverClass.flattenedProps);
			this.serverClasses.push(serverClass);

		}

		this.serverClassBits = 0;
		while(numServerClasses >>= 1) ++this.serverClassBits;
		this.serverClassBits++;
	}

	gatherProps (serverClass, dataTable, excludes, path) {
		let tmp = [];
		this.iterateProps(serverClass, dataTable, tmp, excludes, path);
		for(let i = 0; i < tmp.length; i++){
			serverClass.flattenedProps.push(tmp[i]);
		}
	}
	
	iterateProps (serverClass, dataTable, props, excludes, path) {

		path = path || '';

		if(dataTable.props == null){
			return;
		}

		for(let i = 0; i < dataTable.props.length; i++){

			let prop = dataTable.props[i];

			if((prop.flags & (1 << 8)) ||
				(prop.flags & (1 << 6)) ||
				this.isPropExcluded(dataTable, prop, excludes)){
				continue;
			}

			let propPath = prop.varName == 'baseclass' ?
				'' : prop.varName;

			if(propPath != '' && path != ''){
				propPath = path + '.' + propPath;
			}

			if(prop.type == 6){

				let subTable = this.findDataTable(prop.dataTableName);

				if(prop.flags & (1 << 11)){
					this.iterateProps(serverClass, subTable, props, excludes, propPath);
				} else{
					this.gatherProps(serverClass, subTable, excludes, propPath);
				}

			} else if(prop.type == 5){

				props.push({
					path: propPath,
					prop: prop,
					elm: dataTable.props[i - 1]
				});

			} else{

				props.push({
					path: propPath,
					prop: prop
				});

			}
		}
	}
	
	isPropExcluded (dataTable, prop, excludes) {

		for(let i = 0; i < excludes.length; i++){
			if(dataTable.netTableName == excludes[i].dataTableName &&
				prop.varName == excludes[i].varName){
				return true;
			}
		}

		return false;
	}
	
	gatherExcludes (dataTable, excludes) {

		excludes = excludes || [];

		if(dataTable.props != null){
			for(let i = 0; i < dataTable.props.length; i++){
				let prop = dataTable.props[i];
				if(prop.flags & (1 << 6)){
					excludes.push({
						varName: prop.varName,
						dataTableName: prop.dataTableName,
						netTableName: dataTable.netTableName
					});
				}
				if(prop.type == 6){
					let subTable = this.findDataTable(prop.dataTableName);
					if(subTable != null){
						this.gatherExcludes(subTable, excludes);
					}
				}
			}
		}

		return excludes;
	}
	
	sortProps (flattened) {
		let priorities = [];
		priorities.push(64);

		for(let i = 0; i < flattened.length; i++){
			let prop = flattened[i].prop;
			if(priorities.indexOf(prop.priority) == -1){
				priorities.push(prop.priority);
			}
		}

		priorities.sort(function(a, b){
			return a - b
		});

		let start = 0;
		for(let priority_index = 0; priority_index < priorities.length; priority_index++){
			let priority = priorities[priority_index];
			while(true){
				let currentProp = start;
				while(currentProp < flattened.length){
					let prop = flattened[currentProp].prop;
					if(prop.priority == priority || (priority == 64 && ((1 << 18) & prop.flags))){
						if(start != currentProp){
							let temp = flattened[start];
							flattened[start] = flattened[currentProp];
							flattened[currentProp] = temp;
						}
						start++;
						break;
					}
					currentProp++;
				}
				if(currentProp == flattened.length){
					break;
				}
			}
		}
	}
	
	readPlayer (stream) {
		stream.skip(16);
		let player ={
			'name': stream.string(128),
			'userId': (function(){
				let val = stream.int32();
				return ((val >> 24) & 0xff) |
					((val << 8) & 0xff0000) |
					((val >> 8) & 0xff00) |
					((val << 24) & 0xff000000);
			})(),
			'guid': stream.string(36),
			'fakePlayer': stream.skip(132).bool(),
			'isHLTV': stream.bool()
		};
		stream.skip(22);
		return player;
	}
	
	addPlayer (player, index) {
		if(typeof index !== 'undefined'){
			this.players[index] = player;
		}else{
			this.players.push(player);
		}
	}

	findPlayerById (userId) {
		let index = this.findPlayerIndex(userId);
		if(index > -1){
			return this.players[index];
		}
		return null;
	}

	findPlayerIndex (userId) {
		for(let i = 0; i < this.players.length; i++){
			if(this.players[i] != null && this.players[i].userId == userId){
				return i;
			}
		}
		return -1;
	}

	findPlayerByName (name) {
		let players = this.getPlayers();
		for(let i = 0; i < players.length; i++){
			let player = players[i];
			if(player.getName() == name){
				return player;
			}
		}
	}
	
	handleGameEventsList (message) {
		let possible_events = [];
						
		for(let i = 0; i < message.descriptors.length; i++){
			let descriptor = message.descriptors[i];
			possible_events.push('csgo.' + descriptor.name);
			this.gameEventDescriptors[descriptor.eventId] = descriptor;
		}

		this.emit('possible_events', possible_events);
	}

	handleGameEvent (message) {

		if(this.gameEventDescriptors[message.eventId] != null){

			let description = this.gameEventDescriptors[message.eventId];

			let params ={};
			if(description.keys != null){
				for(let i = 0; i < description.keys.length; i++){
					let key = description.keys[i];
					params[key.name] = message.values[i].value;
				}
			}

			switch(description.name){
				case 'player_connect':
					let player ={
						'name': params.name,
						'userId': params.userid,
						'guid': params.networkid,
						'fakePlayer': params.networkid == 'BOT',
						'isHLTV': false
					};
					this.addPlayer(player, params.index);
					break;

				case 'player_disconnect':
					let entity = this.findEntityByUserId(params.userid);
					params ={
						reason: params.reason,
						player: entity
					}
					break;

				case 'round_start':
					this.match.round = 1;
					this.getTeams().forEach(team =>{
						
						let team_number = team.getTeamNumber();

						if(team_number)
							this.match.round += team.getScore();

					});
					break;

			}

			if(params.userid){
				params.player = this.findEntityByUserId(params.userid);
				delete params.userid;
			}

			if(params.attacker){
				params.attacker = this.findEntityByUserId(params.attacker);
			}

			if(params.assister){
				params.assister = this.findEntityByUserId(params.assister);
			}

			this.emit('event', 'csgo.' + description.name);
			this.emit('csgo.' + description.name, params);
			
			if(description.name == 'player_disconnect'){
				if(typeof player != 'undefined'){
					player.info.connected = false;
					player.info.userId = -1;
				}
			}
		}

	}
	
	handlePacketEntities (message) {
		let entity = null;
		let headerCount = message.updatedEntities;
		let updateFlags = 0;
		let headerBase = -1;
		let entityId = -1;
		let updateType = PacketEntities.PRESERVE_ENT;
		let data = message.entityData;
		while(updateType < 4){
			let isEntity = --headerCount >= 0;
			if(isEntity){
				updateFlags = 0;
				entityId = headerBase + 1 + data.uBitVar();
				headerBase = entityId;
				if(!data.bits(1)){
					if(data.bits(1)){
						updateFlags |= 4;
					}
				} else{
					updateFlags |= 1;
					if(data.bits(1)){
						updateFlags |= 2;
					}
				}
			}
			for(updateType = PacketEntities.PRESERVE_ENT; updateType == PacketEntities.PRESERVE_ENT;){
				if(!isEntity || entityId > 9999){
					updateType = 4;
				} else{
					if(updateFlags & 4){
						updateType = PacketEntities.PVS_ENTER;
					} else if(updateFlags & 1){
						updateType = PacketEntities.PVS_LEAVE;
					} else{
						updateType = PacketEntities.DELTA_ENT;
					}
				}
				switch(updateType){
					case PacketEntities.PVS_ENTER:
						let classIndex = data.bits(this.serverClassBits);
						let serialNum = data.bits(10);
						entity = this.addEntity(entityId, this.serverClasses[classIndex], serialNum);
						let paths = entity.readFromStream(data);
						this.emit('entity_added', entity);
						this.emit('entity_updated', entity, paths);
						break;
					case PacketEntities.PVS_LEAVE:
						let removed = this.removeEntity(entityId);
						this.emit('entity_removed', removed);
						break;
					case PacketEntities.DELTA_ENT:
						entity = this.findEntityById(entityId);
						if(entity != null){
							let paths = entity.readFromStream(data);
							this.emit('entity_updated', entity, paths);
						} else{
							console.log('cant find entity ' + entityId);
							return;
						}
						break;
				}
			}
		}
	}

	getEntities (entityClass) {
        let selectedEntities = [];
        for(let i = 0; i < this.entities.length; i++){
			let entity = this.entities[i];
            if(entityClass == null ||
                entity.classInfo.dataTableName == entityClass ||
                (typeof entityClass == 'function' &&
                    entity instanceof entityClass)){

                selectedEntities.push(entity);
            }
        }
        return selectedEntities;
    }
	
	addEntity (entityId, classInfo, serialNumber) {
		let entity = this.findEntityById(entityId);
		if(entity == null){
			
			if(typeof this.d == 'undefined')
				this.d ={};

			if(typeof this.d[classInfo.dataTableName] == 'undefined')
				this.d[classInfo.dataTableName] = 1;
			else this.d[classInfo.dataTableName]++;
			
			let entity_class;
			if(classInfo.dataTableName.substr(0, 9) === 'DT_Weapon'){
				entity_class = 'Weapon';
			}else entity_class = classInfo.dataTableName.replace('DT_CS', '').replace('DT_', '');
			
			if(typeof EntitiesMap[entity_class] != 'undefined'){
				entity_class = EntitiesMap[entity_class];
			}else{
				entity_class = Entity;
			}

			entity = new entity_class(this);
			entity.entityId = entityId;
			this.entities.push(entity);
		}
		if(entity instanceof EntitiesMap.Player){
			entity.info = this.players[entity.entityId - 1];
		}
		entity.classInfo = classInfo;
		entity.serialNumber = serialNumber;
		return entity;
	}

	removeEntity (entityId) {
		let i = this.entities.length;
		while(i--){
			if(this.entities[i].entityId == entityId){
				return this.entities.splice(i, 1)[0];
			}
		}
	}
	
	findEntityById (entityId) {
		for(let i = 0; i < this.entities.length; i++){
			if(this.entities[i].entityId == entityId){
				return this.entities[i];
			}
		}
	}
	
	findEntityByUserId (userId) {
		let index = this.findPlayerIndex(userId);
		if(index > -1){
			return this.findEntityById(index + 1);
		}
		return null;
	}

}

module.exports = Demo;