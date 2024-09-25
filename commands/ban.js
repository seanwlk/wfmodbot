const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'ban',
	description: 'Bans user from the server and deleted messages from past 7 days',
	async execute(message, args, client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		client.users.fetch((message.mentions.users.first() || args[0])).then(async function(user) {
			if (!user)
				return message.reply("Please mention a valid member of this server");
			let reason = args.slice(1).join(' ');
			if (!reason) reason = "No reason provided";

			let banMessageEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('You got banned from Warface Community')
				.setDescription(`Reason: ${reason}`)
				.setTimestamp();
			user.send({embeds:[banMessageEmbed]}).catch(console.log(`User ${user.tag} will be banned but could not be warned`));

			message.guild.members.ban(user, {
				deleteMessageSeconds: 604800,
				reason: reason
			}).then(() => {
				const logAction = new EmbedBuilder()
					.setColor('#00ff00')
					.setTitle('Member was banned')
					.addFields({name:`Moderator`, value:`${message.member}`, inline:true},
					{name:`Banned User`, value:`${user}\n\`${user.tag}\`\n${user.id}`, inline:true},
					{name:`Reason`, value:`${reason}`, inline:false})
					.setTimestamp();
				message.channel.send({embeds:[logAction]});
			}).catch(err => {
				const logAction = new EmbedBuilder()
					.setColor('#ff0000')
					.setTitle('Cannot ban user')
					.addFields({name:`Moderator`, value:`${message.member}`,inline: true},
					{name:`Reason`, value:`${err}`, inline:false})
					.setTimestamp();
				message.channel.send({embeds:[logAction]});
			});

			// MySQL add ban
			await utils.queryAsync('INSERT INTO wfmodbot.bans (discord_id, username, moderator, guild, reason, date) VALUES (?,?,?,?,?,?)',[
				user.id,
				user.tag,
				message.author.id,
				message.guild.id,
				reason,
				utils.currentUnixTime()
			]);

		}).catch(err => message.channel.send("`" + err.name + ": " + err.message + "`"))
		
	},
};