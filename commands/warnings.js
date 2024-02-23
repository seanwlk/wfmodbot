const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'warnings',
	description: 'Show warnings for a specific user',
	async execute(message, args, client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		if (args.length == 0) {
			return message.reply("You must specify an user ID.");
		};

		let warnings = await utils.queryAsync("SELECT * FROM wfmodbot.warnings WHERE guild = ? AND discord_id = ?",[message.guild.id,args[0]]);
		let warningsEmbed = new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle(`${args[0]} has ${warnings.length} warnings`);
		var embedBody = "";
		Object.keys(warnings).forEach(function(key) {
			var warning = warnings[key];
			let warnDate = new Date(parseInt(warning.date * 1000)).toLocaleDateString("it-IT");
			embedBody += `Mod <@${warning.moderator}> | Reason \`${warning.reason}\` | Date ${warnDate}\n`;
		});
		if (warnings.length === 0) embedBody = "No warnings for this user";
		if (embedBody.length < 1023) {
			warningsEmbed.addFields({name :`These are the warnings for this user`, value: embedBody, inline: true});
		} else {
			warningsEmbed.addFields({name :`Too many warnings`, value: `Please use the [web dashboard](${config.webapp_url}/warnings.php?user=${args[0]}) to check warnings for this user.`, inline: true});
		}
		message.channel.send({embeds:[warningsEmbed]});
	},
};