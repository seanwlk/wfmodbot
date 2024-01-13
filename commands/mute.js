const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'mute',
	description: 'Gives the user the muted role setup in config.js',
	async execute(message, args, client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		message.guild.members.fetch(args[0]).then(function(member) {

			if (!member){
				var member = client.users.cache.get(args[0])
			} 

			let muteTime = args.slice(1).join(' ');
			if (!muteTime) return message.reply("Please specify mute time which can be x time or permanent");
			let amount = muteTime.match(/(\d+)/);
			let time_multiplier = muteTime.replace(/[0-9]/g, '').toLowerCase();

			const currentUnixTime = Math.round((new Date()).getTime() / 1000);
			var muteUntil = currentUnixTime;
			if (time_multiplier === "m" || time_multiplier === "min" || time_multiplier === "minutes") {
				muteUntil = currentUnixTime + (amount[0] * 60);
				console.log(`Muting ${member.user.tag} for ${amount[0]} minutes`);
			} else if (time_multiplier === "h" || time_multiplier === "hours") {
				muteUntil = currentUnixTime + (amount[0] * 3600);
				console.log(`Muting ${member.user.tag} for ${amount[0]} hours`);
			} else if (time_multiplier === "d" || time_multiplier === "days") {
				muteUntil = currentUnixTime + (amount[0] * 86400);
				console.log(`Muting ${member.user.tag} for ${amount[0]} DAYS`);
			} else if (time_multiplier === "permanent") {
				muteUntil = "permanent";
				console.log(`Muting ${member.user.tag} Permanently`);
			} else {
				const muteHelpEmbed = new EmbedBuilder()
					.setColor('#000000')
					.setTitle('Available mute settings')
					.setDescription("You can mute only for minutes, hours and days. Use one of the following syntaxes.")
					.addField({name:'Minutes', value:'- m\n- min\n- minutes',inline: true},
					{name:'Hours', value:'- h\n- hours',inline: true},
					{name:'Days', value:'- d\n- days',inline: true},
					{name:'Permanent', value:'- permanent',inline: true});
				message.channel.send(muteHelpEmbed);
				return;
			}

			let role = message.guild.roles.cache.find(r => r.name === config.mute_role);
			member.roles.add(role).then(() => {
				const logAction = new EmbedBuilder()
					.setColor('#00ff00')
					.setTitle('User was muted')
					.setDescription(`Mute expires: ${(muteUntil === "permanent" ? "Never" : utils.Unix_timestamp(muteUntil))}`)
					.addFields({name:`Moderator`,value: `${message.member}`, inline: true},
					{name:`Muted User`, value: `${member}\n${member.user.tag}\n${member.user.id}`, inline: true})
					.setTimestamp();
				message.channel.send({embeds:[logAction]});

				const muteUntilEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle(`You got muted in server: ${message.guild.name}`)
					.setDescription(`Muted for ${amount[0]} ${time_multiplier}, expires: ${(muteUntil === "permanent" ? "Never" : utils.Unix_timestamp(muteUntil))}`)
					.setTimestamp();
				member.send({embeds:[muteUntilEmbed]});

			}).catch(err => {
				const logAction = new EmbedBuilder()
					.setColor('#ff0000')
					.setTitle('Cannot assign muted role to this user')
					.addField({name:`Moderator`, value:  `${message.member}`, inline: true},
					{name:`Reason`, value:`${err}`, inline:false})
					.setTimestamp();
				message.channel.send({embeds:[logAction]});
			});

			// MySQL add mute
			utils.mysqlcon.getConnection(function(err, connection) {
				if (err) console.log(err);
				connection.query(`INSERT INTO wfmodbot.mutes (discord_id, username, moderator, guild, date, when_unmute) VALUES (\"${member.id}\",\"${utils.mysqlcon.escape((member.user.tag).replace(/[^\x20-\x7E]+/g, ''))}\",\"${message.author.id}\",\"${message.guild.id}\",\"${currentUnixTime}\",\"${muteUntil}\")`, function(err, result) {
					if (err) console.log(err);
				});
				connection.release();
			});
		}).catch(err => message.channel.send("`" + err.name + ": " + err.message + "`"))
	},
};