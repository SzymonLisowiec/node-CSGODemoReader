let Messages = {};
module.exports = Messages;

Messages.Vector = {
	fields: [
		[1, 'x', 'float'],
		[2, 'y', 'float'],
		[3, 'z', 'float']
	]
};

Messages.Vector2D = {
	fields: [
		[1, 'x', 'float'],
		[2, 'y', 'float']
	]
};

Messages.QAngle = {
	fields: [
		[1, 'x', 'float'],
		[2, 'y', 'float'],
		[3, 'z', 'float']
	]
};

Messages.RGBA = {
	fields: [
		[1, 'r', 'varInt32'],
		[2, 'g', 'varInt32'],
		[3, 'b', 'varInt32'],
		[4, 'a', 'varInt32']
	]
};