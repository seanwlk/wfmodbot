const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'banword',
	description: 'Bans a string given by the user and deletes all messages containing such string',
	async execute(message, args, client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;
			if (!args[0]){
				return message.channel.send(`\`No blocked word was specified\``);
			}
			await utils.queryAsync('INSERT INTO wfmodbot.blockedwordlist (word) VALUES (?)',[args[0].toLocaleLowerCase()]);
			config.blockedwordlist.push(args[0]);
			message.react("\u2705");
	},
};
