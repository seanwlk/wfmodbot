const utils = require('./utils.js');

var config = {
  bot_token: null,
  bot_token_dev: null,
  bot_admins: null,
  prefix: null,
  messagesToCache: [],
  WarnTemplates: {},
  reactionToRole : {
    "pc"  : "PC",
    "xbox" : "Xbox",
    "playstation" : "PS",
    "switch" : "Switch"
  },
  autoreactions: {
    bugreportChannels: [],
    feedbackChannels: [],
    newsChannels: []
  },
  setConfig: function(newConfig) {
    config = { ...config, ...newConfig };
  },
  updateConfig: async function() {
    const confs = await utils.queryAsync('SELECT var, value FROM config');
    const templates = await utils.queryAsync('SELECT template, message FROM warntemplates');
    const msgCache = await utils.queryAsync('SELECT channel, message FROM messagestocache');
    const admins = await utils.queryAsync(`SELECT discord_id FROM users WHERE type = 'admin'`);
    const autoReactionsBugreport = await utils.queryAsync(`SELECT channel FROM channelautoreactions WHERE reactiontype = 'bugreport'`);
    const autoReactionsFeedback = await utils.queryAsync(`SELECT channel FROM channelautoreactions WHERE reactiontype = 'feedback'`);
    const autoReactionsNews = await utils.queryAsync(`SELECT channel FROM channelautoreactions WHERE reactiontype = 'news'`);
    const blockedwordlist = await utils.queryAsync(`SELECT word FROM blockedwordlist`);
    confs.forEach(e => {
      config[e.var] = e.value
    });
    templates.forEach(e => {
      config.WarnTemplates[e.template] = e.message
    });
    config.bot_admins = admins.map(row => row.discord_id);
    config.messagesToCache = JSON.parse(JSON.stringify(msgCache));
    config.autoreactions= {
      bugreportChannels: autoReactionsBugreport.map(row => row.channel),
      feedbackChannels: autoReactionsFeedback.map(row => row.channel),
      newsChannels: autoReactionsNews.map(row => row.channel)
    };
    config.blockedwordlist = blockedwordlist.map(row => row.word);
    return config;
  },
  getConfig: function() {
    return config;
  },
};

module.exports = config;