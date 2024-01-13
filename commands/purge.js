const Discord = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'purge',
	description: 'Delete messages by amount or by specific user',
	execute(message,args,client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      const deleteCount = parseInt(args[0]);
      if (deleteCount) {
        message.channel.bulkDelete(deleteCount)
          .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
          message.delete()
      } else {
        return message.reply("Please provide a number of messages to delete");
      }
    } else {
      const deleteCount = parseInt(args[1]);
      if (deleteCount) {
        var reqMessage = message;
        message.channel.messages.fetch(force=true)
          .then(function(messages) {
            var i = 0;
            messages.filter(function(m) {
              if ((m.author.id === member.user.id) && (i < deleteCount)) {
                m.delete()
                i++;
              }
            })
            message.delete()
          })
          .catch(error => reqMessage.channel.send(`Couldn't delete messages because of: ${error}`));
      } else {
        message.reply("Please provide a number of messages to delete");
        return;
      }
    }
	},
};