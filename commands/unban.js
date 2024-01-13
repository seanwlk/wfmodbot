const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'unban',
	description: 'Removed ban from a user in the guild',
	async execute(message, args, client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		client.users.fetch((message.mentions.users.first() || args[0])).then(function(user) {

			message.guild.members.unban(user).then(() => {
				message.reply(`:white_check_mark:    **${user.tag}** has been unbanned by ${message.author.tag}`);
			}).catch(err => {
				message.channel.send(`Sorry ${message.author} I could not unban because of : ${err}`);
			});

			// MySQL remove ban
			utils.mysqlcon.getConnection(function(err, connection) {
				if (err) console.log(err);
				connection.query(`DELETE FROM wfmodbot.bans WHERE guild = ${message.guild.id} AND discord_id = ${user.id}`, function(err, result) {
					if (err) console.log(err);
				});
				connection.release();
			});

		}).catch(err => message.channel.send("`" + err.name + ": " + err.message + "`"))
	},
};