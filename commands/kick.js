const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'kick',
	description: 'Kicks a member from the server',
	async execute(message,args,client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		message.guild.members.fetch(args[0]).then(function(member) {
      if (!member)
        return message.reply("Please mention a valid member of this server");
      if (!member.kickable)
        return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
      // slice(1) removes the first part, which here should be the user mention or ID
      // join(' ') takes all the various parts to make it a single string.
      let reason = args.slice(1).join(' ');
      if (!reason) reason = "No reason provided";

      member.kick(reason).then(() => {
        message.reply(`:white_check_mark:    **${member.user.tag}** has been kicked by ${message.author.tag} because: ${reason}`);
      }).catch(err => {
        message.channel.send(`Sorry ${message.author} I could not kick because of : ${err}`);
      });
    }).catch(err => message.channel.send("`" + err.name + ": " + err.message + "`"))
	},
};