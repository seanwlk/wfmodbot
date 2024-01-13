const fs = require('fs');
const Discord = require('discord.js');
//const { GatewayVersion } = require('discord-api-types/gateway/v10');
var config = require('./config.js');
const utils = require('./utils.js');

const client = new Discord.Client({intents: [
    Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildBans,
		Discord.GatewayIntentBits.GuildMessageReactions,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildPresences,
		Discord.GatewayIntentBits.DirectMessages
	] });
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.blockedwordlist = [];


// ERROR HANDLERS
process.on('uncaughtException', function(err) {
  console.log(err);
  let errorEmbed = new Discord.EmbedBuilder()
    .setTitle("Error")
    .setColor('#ff0000')
    .setDescription("``` " + err.stack + "```")
  client.channels.cache.get(config.ERROR_CHANNEL).send({embeds:[errorEmbed]})
})

process.on('unhandledRejection', err => {
  //throw err;
  console.log(err);
});

client.on('error', err => {
  //throw err;
  console.log(err);
  client.channels.cache.get(config.ERROR_CHANNEL).send(err)
});
// ERROR HANDLERS

//* LOOP FUNCTIONS
function unMuteCheck() {
  utils.mysqlcon.getConnection(function(err, connection) {
    if (err) console.log(err);
    connection.query("SELECT * FROM wfmodbot.mutes", function(err, result, fields) {
      if (err) console.log(err);
      let currentUnixTime = Math.round((new Date()).getTime() / 1000);
      Object.keys(result).forEach(function(key) {
        var mute = result[key];
        if (currentUnixTime > parseInt(mute.when_unmute)) {
          connection.query(`DELETE FROM wfmodbot.mutes WHERE id = ${mute.id}`, function(err, result, fields) {
            if (err) console.log(err);
            let modguild = client.guilds.cache.get(mute.guild);
            let user = mute.discord_id;
            modguild.members.fetch({ user, force: true })
              .then(member => {
                let role = modguild.roles.cache.find(r => r.name === config.mute_role);
                member.roles.remove(role).then(() => {
                  console.log(`Mute for ${mute.username} expired`);
                }).catch(err => {
                  console.log(`Error while removing mute from ${mute.username} | ${err} `);
                });
              })
              .catch(err => {console.log(`Mute for ${mute.username} expired. But user is not in the server. | ${err} `)})
          });
        }
      });
    });
    connection.release();
  });
}

function clearRoleReactions(){
  let msg = client.channels.cache.get(config.messagesToCache[0].channel).messages.cache.get(config.messagesToCache[0].message)
  msg.reactions.cache.forEach(reaction => {
    reaction.users.fetch()
    .then(users=> {
      users.forEach(user => {
        if (user.id != client.user.id) reaction.users.remove(user.id)
      })
    })
  })
}

setInterval(unMuteCheck, 150000); // 2.5 MIN 150000
setInterval(clearRoleReactions, 150000); // 2.5 MIN 150000
//LOOP FUNCTIONS */

// CUSTOM FUNCTIONS
function containsWordFromList(input, words) {
 return words.some(word => input.toLowerCase().includes(word.toLowerCase()));
}

function bannedWordslist(input){
  return client.blockedwordlist.some(word => input.toLowerCase().includes(word.toLowerCase()));
}

function feedbackChannelReactions(message){
  if (config.autoreactions.feedbackChannels.includes(message.channel.id)){
    let upvote = client.guilds.cache.get(config.DEV_SERVER).emojis.cache.find(r => r.name === "upvote")
    let downvote = client.guilds.cache.get(config.DEV_SERVER).emojis.cache.find(r => r.name === "downvote")
    message.react(upvote)
      .then(()=>message.react(downvote))
  } else {
    return
  }
}

function bugreportChannelReactions(message){
  if (config.autoreactions.bugreportChannels.includes(message.channel.id)){
    message.react("❗")
      .then(()=>message.react("❌"))
  } else {
    return
  }
}

function deleteMessagesFilter(message){
  if ((containsWordFromList(message.content,['discord.gg/','discordapp.com/invite/']) || 
      bannedWordslist(message.content)) && !(message.content.includes('discord.gg/wf') || 
      message.content.includes('discord.gg/warface') || 
      message.content.includes('discord.gg/VrUqt4W'))) { 
    if (!message.member) return
    if (message.member.manageable) {
      message.delete().catch(()=> {
        console.log("ERR | Autodeleting message in: "+message.channel.name)
      })
    }
  }
}

function loadBlockedWordsList() {
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
}
// CUSTOM FUNCTIONS


// Check if users is muted when he joins server
client.on('guildMemberAdd', member => {
  utils.mysqlcon.getConnection(function(err, connection) {
    if (err) console.log(err);
    connection.query(`SELECT * FROM wfmodbot.mutes WHERE guild = ${member.guild.id} AND discord_id = ${member.user.id}`, function(err, result, fields) {
      if (err) console.log(err);
      if (result.length !== 0) {
        let role = member.guild.roles.cache.find(r => r.name === config.mute_role);
        member.roles.add(role).then(() => {
          console.log(`${member.user.username} joined ${member.guild.name} and got muted`);
        }).catch(err => {
          console.log(`Error while muting ${member.user.tag} on server join`);
        });
      }
    });
    connection.release();
  });
  
  // JUST TO REFRESH ONLINE STATUS
  client.user.setPresence({ activities: [{ name: 'over Warface Community Discord', type: Discord.ActivityType.Watching }], status: 'online' });
  // JUST TO REFRESH ONLINE STATUS
  
});

client.on('messageReactionAdd', (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id == config.messagesToCache[0].message){
    let member = client.guilds.cache.get(reaction.message.guild.id).members.cache.get(user.id)
    let role = null;
    switch (reaction.emoji.name) {
      case 'pc':
        role = reaction.message.guild.roles.cache.find(r => r.name === config.reactionToRole[reaction.emoji.name]);
        break;
      case 'playstation':
        role = reaction.message.guild.roles.cache.find(r => r.name === config.reactionToRole[reaction.emoji.name]);
  			break;
      case 'xbox':
        role = reaction.message.guild.roles.cache.find(r => r.name === config.reactionToRole[reaction.emoji.name]);
  			break;
  	  case 'switch':
        role = reaction.message.guild.roles.cache.find(r => r.name === config.reactionToRole[reaction.emoji.name]);
  			break;
    }
    
    if (role !== null && member) {
      if (!member.roles.cache.some(r => r.name === role.name)) {
        member.roles.add(role)
          .then(utils.sleeper(1000))
          .then(()=>{
            if (member.id != client.user.id){ 
              reaction.users.remove(member.id)
            }
          })
      } else {
        member.roles.remove(role)
          .then(utils.sleeper(1000))
          .then(()=>{
            if (member.id != client.user.id){ 
              reaction.users.remove(member.id)
            }
          })
      }
    }
    
  }
});

client.on('ready', () => {
  // Cache the Message to watch reactions from
  config.messagesToCache.forEach(k => client.channels.cache.get(k.channel).messages.fetch(k.message));
  // Cache theMessage to watch reactions from
  console.log(`[${new Date()}]\nWFModBot has started.\n    Watching over ${client.users.cache.size} users\n    ${client.channels.cache.size} channels\n    ${client.guilds.cache.size} Servers`);
  client.user.setPresence({ activities: [{ name: 'over Warface Community Discord', type: Discord.ActivityType.Watching }], status: 'online' });
  loadBlockedWordsList();
});

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	feedbackChannelReactions(message);
	bugreportChannelReactions(message)
	deleteMessagesFilter(message); // Delete messages with discord invites + ban words (scam links)
  if (message.content.indexOf(config.prefix) !== 0) return;
  if (message.guild === null) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

	try {
		await client.commands.get(command).execute(message, args, client);
	} catch (error) {
		console.error(error);
		message.react("\u2757")
	}
});

config.updateConfig().then(()=>{
  client.login(config.bot_token);
})
