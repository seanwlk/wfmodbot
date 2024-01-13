const utils = require('./utils.js');
const util = require('util');

var config = {
  bot_token: null,
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
    const queryAsync = util.promisify(utils.mysqlcon.query).bind(utils.mysqlcon);
    const confs = await queryAsync('SELECT var, value FROM wfmodbot.config');
    const templates = await queryAsync('SELECT template, message FROM wfmodbot.warntemplates');
    const msgCache = await queryAsync('SELECT channel, message FROM wfmodbot.messagestocache');
    const admins = await queryAsync(`SELECT discord_id FROM wfmodbot.users WHERE type = 'admin'`);
    const autoReactionsBugreport = await queryAsync(`SELECT channel FROM wfmodbot.channelautoreactions WHERE reactiontype = 'bugreport'`);
    const autoReactionsFeedback = await queryAsync(`SELECT channel FROM wfmodbot.channelautoreactions WHERE reactiontype = 'feedback'`);
    confs.forEach(e => {
      this[e.var] = e.value
    });
    templates.forEach(e => {
      this.WarnTemplates[e.template] = e.message
    });
    this.setConfig({Admin: admins.map(row => row.discord_id)});
    this.setConfig({messagesToCache: JSON.parse(JSON.stringify(msgCache))});
    this.setConfig({autoreactions:{bugreportChannels: autoReactionsBugreport.map(row => row.channel),feedbackChannels: autoReactionsFeedback.map(row => row.channel)}});
    return config;
  },
  getConfig: function() {
    return config;
  },
};

module.exports = config;