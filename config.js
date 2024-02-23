const utils = require('./utils.js');

var config = {
  bot_token: null,
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
    feedbackChannels: []
  },
  setConfig: function(newConfig) {
    config = { ...config, ...newConfig };
  },
  updateConfig: async function() {
    const confs = await utils.queryAsync('SELECT var, value FROM wfmodbot.config');
    const templates = await utils.queryAsync('SELECT template, message FROM wfmodbot.warntemplates');
    const msgCache = await utils.queryAsync('SELECT channel, message FROM wfmodbot.messagestocache');
    const admins = await utils.queryAsync(`SELECT discord_id FROM wfmodbot.users WHERE type = 'admin'`);
    const autoReactionsBugreport = await utils.queryAsync(`SELECT channel FROM wfmodbot.channelautoreactions WHERE reactiontype = 'bugreport'`);
    const autoReactionsFeedback = await utils.queryAsync(`SELECT channel FROM wfmodbot.channelautoreactions WHERE reactiontype = 'feedback'`);
    const blockedwordlist = await utils.queryAsync(`SELECT word FROM wfmodbot.blockedwordlist`);
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
      feedbackChannels: autoReactionsFeedback.map(row => row.channel)
    };
    config.blockedwordlist = blockedwordlist.map(row => row.word);
    return config;
  },
  getConfig: function() {
    return config;
  },
};

module.exports = config;