const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'warn',
	description: 'Sends warning to a user and saves it into the MySQL database',
	async execute(message, args, client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		message.guild.members.fetch(args[0]).then(async function(member) {

			if (!member){
				var member = client.users.cache.get(args[0])
			}
			var reason = args.slice(1).join(' ');

			if (!reason) return message.reply("Please enter a warning reason");

			// MySQL add warning
			let ShowWarnName = await utils.queryAsync('SELECT ShowWarnName FROM users WHERE discord_id= ?',[message.author.id]);
			const reasonEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`You got a warning from ${message.guild.name}`)
				.setTimestamp();

			if (config.WarnTemplates.hasOwnProperty(reason.toLocaleLowerCase())) {
				let template = reason.toLocaleLowerCase();
				reason = config.WarnTemplates[template];
				reasonEmbed.setDescription(reason);
			} else reasonEmbed.setDescription(reason);

			if (ShowWarnName[0].ShowWarnName === 1) {
				reasonEmbed.setAuthor({name:message.author.username, iconURL:message.author.avatarURL()})
			}
			member.send({embeds:[reasonEmbed]}).then(() => {
				const logAction = new EmbedBuilder()
					.setColor('#00ff00')
					.setTitle('Warning sent successfully')
					.addFields({name:`Moderator`, value: `${message.member}`, inline: true},
					{name:`Warned User`, value: `${member}\n\`${member.user.tag}\`\n${member.user.id}\n[Warnings on dashboard](${config.webapp_url}/warnings.php?user=${member.id})`,inline:  true},
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

			await utils.queryAsync('INSERT INTO warnings (discord_id, username, moderator, guild, reason, date) VALUES (?,?,?,?,?,?)',[
				member.id,
				member.user.tag,
				message.author.id,
				message.guild.id,
				(config.WarnTemplates[reason.toLocaleLowerCase()] === undefined ? reason : config.WarnTemplates[reason.toLocaleLowerCase()]),
				utils.currentUnixTime()
			]);
		}).catch(err => message.channel.send("`" + err.name + ": " + err.message + "`"))
	},
};