class Protobuf {

	constructor () {
		this.enums = {};
		this.messages = {};
	}

	require (path, namespace) {
		let scheme = require(path);
		
		for(let msg_name in scheme){

			let msg_scheme = scheme[msg_name];

			if(typeof namespace != 'undefined')
				msg_name = namespace + '/' + msg_name;
				
			this.require_msg(this, msg_name, msg_scheme);

		}
	}

	require_msg (parent, msg_name, msg_scheme) {

		let msg = parent.addMessage(msg_name);

		if(typeof msg_scheme.messages != 'undefined'){

			for(let sub_message_name in msg_scheme.messages){
				this.require_msg(msg, sub_message_name, msg_scheme.messages[sub_message_name]);
			}

		}
		
		for(let field in msg_scheme.fields){

			field = msg_scheme.fields[field];
			
			if(typeof msg.messages[field[2]] != 'undefined'){
				field[2] = msg.messages[field[2]];
			}else if(typeof this.getMessage(field[2] ) != 'undefined'){
				field[2] = this.getMessage(field[2]);
			}else if(field[2].indexOf('.') > -1){

				let s = field[2].split('.');
				let m = this.getMessage(s[0]);
				if(typeof m != 'undefined'){

					m = m.getMessage(s[1]);
					if(typeof m != 'undefined'){
						field[2] = m;
					}

				}

			}

			msg.addField(field[0], field[1], field[2], field[3], field[4]);

		}

	}

	addEnums (name, enums) {
		this.enums[name] = Object.freeze(enums);
		return this.enums[name];
	}

	getEnums (name) {
		return this.enums[name];
	}

	addMessage (msg) {
		this.messages[msg] = new ProtobufMessage();
		return this.messages[msg];
	}

	getMessage (msg){
		return this.messages[msg];
	}

}

class ProtobufMessage {

	constructor () {
		this.messages = {};
		this.fields = {};
	}

	addMessage (msg) {
		this.messages[msg] = new ProtobufMessage();
		return this.messages[msg];
	}

	getMessage (msg){
		return this.messages[msg];
	}

	addField (id, name, method, args, type) {
		this.fields[id] = {
			'name': name,
			'method': method,
			'type': type || 'value',
			'args': args || []
		};
		return this;
	}

	getField (id) {
		return this.fields[id];
	}

	decode (stream, size) {

		let data = {};
        size = size || stream.varInt32();
		let offset = stream.tell();
		
        while (stream.tell() < offset + size) {
            let tag = stream.varInt32();
            let id = tag >> 3;
			let field = this.getField(id);
			
            if (field != null) {
                let val = null;
                if (typeof field.method == 'string') {
                    if (stream[field.method] == null) {
                        throw Error('Unable to find method ' + field.method);
                    }
                    val = stream[field.method].apply(stream, field.args);
                } else {
                    val = field.method.decode(stream);
                }

                if (field.type == 'array') {

                    if (data[field.name] == null) {
                        data[field.name] = [];
                    }
                    data[field.name].push(val);
                } else {
                    data[field.name] = val;
                }
			}
			
		}

		stream.seek(offset + size);

        return data;
	}

}

module.exports = Protobuf;