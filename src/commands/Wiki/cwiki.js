const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			aliases: ['set-wiki'],
			cooldown: 30,
			deletable: true,
			guarded: true,
			permissionLevel: 6,
			description: 'Set\'s the wiki for this channel',
			usage: '<wiki:string>',
		});
	}

	async run(message, [wiki]) {
		await message.guild.settings.update('channelOverwrites', [message.channel.id, wiki]);
		return message.send(`The Wiki for this channel is now set to: ${wiki}`);
	}

};
