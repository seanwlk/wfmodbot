const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'unmute',
	description: 'Removes muted role from a user',
	async execute(message, args, client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		message.guild.members.fetch(args[0]).then(async function(member) {
			if (!member) return message.reply("Please mention a valid member of this server");

			let role = message.guild.roles.cache.find(r => r.name === config.mute_role);
			member.roles.remove(role).then(() => {
				const logAction = new EmbedBuilder()
					.setColor('#00ff00')
					.setTitle('Mute was removed from user')
					.addFields({name:`Moderator`, value:`${message.member}`, inline:true},
					{name:`Unmuted User`, value:`${member}\n\`${member.user.tag}\`\n${member.user.id}`, inline:true})
					.setTimestamp();
				message.channel.send({embeds:[logAction]});
			}).catch(err => {
				const logAction = new EmbedBuilder()
					.setColor('#ff0000')
					.setTitle('User could not be unmuted')
					.addField({name:`Moderator`, value: `${message.member}`, inline:true},
					{name:`Reason`, value: `${err}`, inline:false})
					.setTimestamp();
				message.channel.send({embeds:[logAction]});
			});

			// MySQL remove mute
			await utils.queryAsync('DELETE FROM mutes WHERE guild = ? AND discord_id = ?',[
				message.guild.id,
				member.id
			]);
		}).catch(err => message.channel.send("`" + err.name + ": " + err.message + "`"))
	},
};