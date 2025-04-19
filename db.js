const { Sequelize, Op, QueryTypes, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PWD, {
  host: process.env.DB_HOST,
  logging: false,
  port: process.env.DB_PORT,
  dialect: ( process.env.DB_DIALECT && process.env.DB_DIALECT.toLocaleLowerCase() == 'mariadb' ? 'mariadb' : 'postgres')/* 'postgres' | 'mariadb' */
});

async function rawQuery(q,p=null) {
  /* One day this has to go in favor of the ORM methods with the specific models */
  return await sequelize.query(q, {
    type: QueryTypes.SELECT,
    replacements: p
  })
};

const dbModels = {
  config: sequelize.define("config", {
    'var': {
      type: DataTypes.STRING,
    },
    'value': {
      type: DataTypes.STRING,
    }
  }, {
    tableName: "config",
    timestamps: false
  }),
  mutes: sequelize.define("mutes", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    dicord_id: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
    },
    moderator: {
      type: DataTypes.STRING,
    },
    guild: {
      type: DataTypes.STRING,
    },
    'date': {
      type: DataTypes.STRING,
    },
    when_unmute: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: "mutes",
    timestamps: false
  })
}

module.exports = { sequelize, dbModels, rawQuery }