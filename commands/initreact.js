const Discord = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'initreact',
	description: 'Adds the platform emoji reactions to a message.',
	async execute(message,args,client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;
		let pcEmoji = client.guilds.cache.get(config.MAIN_SERVER).emojis.cache.find(r => r.name === "pc");
		let ps4Emoji = client.guilds.cache.get(config.MAIN_SERVER).emojis.cache.find(r => r.name === "playstation");
		let xboxEmoji = client.guilds.cache.get(config.MAIN_SERVER).emojis.cache.find(r => r.name === "xbox");
		let switchEmoji = client.guilds.cache.get(config.MAIN_SERVER).emojis.cache.find(r => r.name === "switch");
		let msg = client.guilds.cache.get(config.MAIN_SERVER).channels.cache.get(config.messagesToCache[0].channel).messages.cache.get(config.messagesToCache[0].message)
		msg.reactions.removeAll().then(()=>{
			msg.react(pcEmoji)
			msg.react(ps4Emoji)
			msg.react(xboxEmoji)
			msg.react(switchEmoji)
		}).then(()=>{
			message.react("\u2705")
		})
	},
};