const Discord = require('discord.js');
var config = require('../config.js');

module.exports = {
	name: 'reload',
	description: 'Reloads all configs from DB',
	async execute(message,args,client) {
		if (!config.admins.includes(message.author.id)) return;
		config.updateConfig().then(()=>{
			message.react("\u2705")
		})
	},
};