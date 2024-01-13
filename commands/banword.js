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
			} else if (args[0].toLocaleLowerCase() == "refresh") {
				utils.mysqlcon.getConnection(function(err, connection) {
					if (err) console.log(err);
					connection.query(`SELECT * FROM wfmodbot.blockedwordlist`, function(err, result, fields) {
						if (err) console.log(err);
						client.blockedwordlist = [];
						Object.keys(result).forEach(function(key) {
						  client.blockedwordlist.push(result[key].word)
						});
					});
					connection.release();
				});
				return message.channel.send(`\`Blocked word list was refreshed\``);
			}

			// MySQL add banned word
			let currentUnixTime = Math.round((new Date()).getTime() / 1000);
			utils.mysqlcon.getConnection(function(err, connection) {
				if (err) console.log(err);
				connection.query(`INSERT INTO wfmodbot.blockedwordlist (word) VALUES (${utils.mysqlcon.escape( args[0].toLocaleLowerCase() )})`, function(err, result) {
					if (err) console.log(err);
					const logAction = new EmbedBuilder()
							.setColor('#00ff00')
							.setTitle('Blocked word was added to the database')
							.addFields({name:`Word`, value:`\`${args[0]}\``, inline: true},
							{name:`Current wordlist`, value:`[Click here](https://seanwlk.cf/wfmodbot/blockedwordlist.php)`, inline: true})
							.setTimestamp();
						client.blockedwordlist.push(args[0])
						message.channel.send({embeds:[logAction]});
				});
				connection.release();
			});
	},
};