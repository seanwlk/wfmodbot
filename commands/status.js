const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'status',
	description: 'current status',
	publicAvailable: false,
	async execute(message,args,client) {
  	if (!config.admins.includes(message.author.id)) return;
    let statusEmbed = new EmbedBuilder()
      .setTitle(":gear: Service Status :gear:")
      .setColor('#00ff00')
      .addFields(
    		{ name: 'Total Guilds', value: `${client.guilds.cache.size}`, inline: true},
    		{ name: 'Total Users', value: `${client.users.cache.size}`, inline: true },
    		{ name: 'Total Channels', value: `${client.channels.cache.size}`, inline: true },
    	);
    message.channel.send({embeds:[statusEmbed]})
	},
};