const { Client } = require('klasa');
const { config, token } = require('./config');

Client.defaultGuildSchema
	.add('wiki', 'string')
	.add('channelOverwrites', 'any', { array: true });

new Client(config).login(token);
