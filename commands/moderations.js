const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'moderations',
	description: 'Show current active mutes',
	async execute(message,args,client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;
    let mutes = await utils.queryAsync("SELECT * FROM wfmodbot.mutes WHERE guild = 309400144967761931",[message.guild.id]);
    let moderationsEmbed = new EmbedBuilder()
          .setColor('#ffff00')
          .setURL(`${config.webapp_url}/mutes.php`)
          .setTitle(`${mutes.length} Active mutes`);
    let embedBody = '';
    let ts = utils.currentUnixTime();
    Object.keys(mutes).forEach(function(key) {
      var mute = mutes[key];
      embedBody += `<@${mute.discord_id}> | Remaining ${utils.secToHMS(mute.when_unmute - ts)}\n`;
    });
    if (mutes.length === 0) embedBody = "No active mutes";
    try {
      moderationsEmbed.addFields({name:'These are the current Active Mutes', value:embedBody, inline:true});
    } catch {
      moderationsEmbed.addFields({name:`Too many moderations to be displayed`, value: `Check dashboard: <${config.webapp_url}/mutes.php>`, inline:true})
    }
    message.channel.send({embeds:[moderationsEmbed]});
	},
};