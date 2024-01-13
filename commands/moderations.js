const { EmbedBuilder } = require('discord.js');
var config = require('../config.js');
const utils = require('../utils.js');

module.exports = {
	name: 'moderations',
	description: 'Show current active mutes',
	async execute(message,args,client) {
		if ((!message.member.roles.cache.some(r => r.name === config.Moderator)) && (!message.member.roles.cache.some(r => r.name === config.Admin))) return;

		utils.mysqlcon.getConnection(function(err, connection) {
      if (err) console.log(err);
      connection.query(`SELECT * FROM wfmodbot.mutes WHERE guild = ${message.guild.id}`, function(err, result, fields) {
        if (err) console.log(err);
        let moderationsEmbed = new EmbedBuilder()
          .setColor('#ffff00')
          .setURL("${config.webapp_url}/mutes.php")
          .setTitle(`${result.length} Active mutes`);
        var mutes = "";
        const currentUnixTime = Math.round((new Date()).getTime() / 1000);
        Object.keys(result).forEach(function(key) {
          var mute = result[key];
          mutes += `<@${mute.discord_id}> | Remaining ${utils.secToHMS(mute.when_unmute - currentUnixTime)}\n`;
        });
        if (mutes === "") mutes = "No active mutes";
        try {
          moderationsEmbed.addFields({name:'These are the current Active Mutes', value:mutes, inline:true});
        } catch {
          message.reply("`Too many moderations to be displayed. Check dashboard: `" + "<${config.webapp_url}/mutes.php>")
        }
        message.channel.send({embeds:[moderationsEmbed]});
      });
      connection.release();
    });
	},
};