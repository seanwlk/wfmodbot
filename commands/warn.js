const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'warn',
	description: 'Sends warning to a user and saves it into the MySQL database',
	async execute(message, args, client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		message.guild.members.fetch(args[0]).then(function(member) {

			if (!member){
				var member = client.users.cache.get(args[0])
			}
			var reason = args.slice(1).join(' ');

			if (!reason) return message.reply("Please enter a warning reason");

			// MySQL add warning
			let currentUnixTime = Math.round((new Date()).getTime() / 1000);
			utils.mysqlcon.getConnection(function(err, connection) {
				if (err) console.log(err);
				connection.query(`SELECT ShowWarnName FROM wfmodbot.users WHERE discord_id=${message.author.id}`, function(err, result, fields) {
					const reasonEmbed = new EmbedBuilder()
						.setColor('#0099ff')
						.setTitle('You got a warning from Warface Community')
						.setTimestamp();

					if (config.WarnTemplates.hasOwnProperty(reason.toLocaleLowerCase())) {
						let template = reason.toLocaleLowerCase();
						reason = config.WarnTemplates[template];
						reasonEmbed.setDescription(reason);
					} else reasonEmbed.setDescription(reason);

					if (result[0].ShowWarnName === 1) {
						reasonEmbed.setAuthor({name:message.author.username, iconURL:message.author.avatarURL()})
					}
					member.send({embeds:[reasonEmbed]}).then(() => {
						const logAction = new EmbedBuilder()
							.setColor('#00ff00')
							.setTitle('Warning sent successfully')
							.addFields({name:`Moderator`, value: `${message.member}`, inline: true},
							{name:`Warned User`, value: `${member}\n${member.user.tag}\n${member.user.id}\n[Warnings on dashboard](https://seanwlk.cf/wfmodbot/warnings.php?user=${member.id})`,inline:  true},
							{name :`Reason`, value: `${reason}`, inline: false})
							.setTimestamp();
						message.channel.send({embeds:[logAction]});
					}).catch(err => {
						const logAction = new EmbedBuilder()
							.setColor('#ff0000')
							.setTitle('Warning was not sent but added on DB')
							.addFields({name:`Moderator`, value:`${message.member}`, inline:true},
							{name:`Reason`, value:`${err}`, inline:false})
							.setTimestamp();
						message.channel.send({embeds:[logAction]});
					});
				});

				connection.query(`INSERT INTO wfmodbot.warnings (discord_id, username, moderator, guild, reason, date) VALUES (\"${member.id}\",\"${utils.mysqlcon.escape((member.user.tag).replace(/[^\x20-\x7E]+/g, ''))}\",\"${message.author.id}\",\"${message.guild.id}\",\"${utils.mysqlcon.escape(  (config.WarnTemplates[reason.toLocaleLowerCase()] === undefined ? reason : config.WarnTemplates[reason.toLocaleLowerCase()])  )}\",\"${currentUnixTime}\")`, function(err, result) {
					if (err) console.log(err);
				});
				connection.release();
			});
		}).catch(err => message.channel.send("`" + err.name + ": " + err.message + "`"))
	},
};