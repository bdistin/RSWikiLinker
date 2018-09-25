const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			aliases: ['overwrite-wiki'],
			cooldown: 30,
			deletable: true,
			guarded: true,
			permissionLevel: 6,
			description: 'Set\'s the wiki for this channel',
			usage: '<wiki:string>',
		});
	}

	async run(message, [wiki]) {
		const overwrites = new Map(message.guild.settings.channelOverwrites);
		overwrites.set(message.channel.id, wiki);
		await message.guild.settings.update('channelOverwrites', [...overwrites], { action: 'overwrite' });
		return message.send(`The Wiki for this channel is now set to: ${wiki}`);
	}

};
