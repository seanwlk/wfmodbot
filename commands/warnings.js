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
		utils.mysqlcon.getConnection(function(err, connection) {
			if (err) console.log(err);
			connection.query(`SELECT * FROM wfmodbot.warnings WHERE guild = ${message.guild.id} AND discord_id = \"${args[0]}\"`, function(err, result, fields) {
				if (err) console.log(err);
				let warningsEmbed = new EmbedBuilder()
					.setColor('#ff0000')
					.setTitle(`${args[0]} has ${result.length} warnings`);
				var warnings = "";
				const currentUnixTime = Math.round((new Date()).getTime() / 1000);
				Object.keys(result).forEach(function(key) {
					var warning = result[key];
					let warnDate = new Date(parseInt(warning.date * 1000)).toLocaleDateString("it-IT");
					warnings += `Mod <@${warning.moderator}> | Reason ${warning.reason} | Date ${warnDate}\n`;
				});
				if (warnings === "") warnings = "No warnings for this user";
				if (warnings.length < 1023) {
					warningsEmbed.addFields({name :`These are the warnings for this user`, value: warnings, inline: true});
				} else {
					warningsEmbed.addFields({name :`Too many warnings`, value: `Please use the [web dashboard](https://seanwlk.cf/wfmodbot/warnings.php?user=${args[0]}) to check warnings for this user.`, inline: true});
				}
				message.channel.send({embeds:[warningsEmbed]});
			});
			connection.release();
		});
	},
};