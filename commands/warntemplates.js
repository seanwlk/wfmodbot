const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'warntemplates',
	description: 'Show the available warning templates',
	async execute(message,args,client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		let templatesEmbed = new EmbedBuilder()
      .setColor('#000000')
      .setTitle(`Warning Templates`);
    let fields = [];
    Object.keys(config.WarnTemplates).forEach(function(k) {
      fields.push({name: `Name: ${k}`, value: config.WarnTemplates[k], inline:  true});
    });
    templatesEmbed.addFields(fields);
    message.channel.send({embeds:[templatesEmbed]});
	},
};