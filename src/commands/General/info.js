const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			cooldown: 30,
			deletable: true,
			guarded: true,
			description: 'Shows the info for this guild.',
		});
	}

	async run(message) {
		const response = [
			`Info for server: ${message.guild.name}`,
			message.guild.settings.wiki ?  `Main wiki: ${message.guild.settings.wiki}` : 'No main wiki set',
		];

		if (message.guild.settings.channelOverwrites.length) {
			response.push('Channel overwrites:');
			for (const [channelID, wiki] of message.guild.settings.channelOverwrites) {
				const channel = message.guild.channels.get(channelID);

				if (!channel) continue;

				response.push(`  Wiki ${wiki} in channel ${channel.name}`);
			}
		} else {
			response.push('No channel channel overwrites set');
		}

		message.sendCode('', response.join('\n'));
	}

};
