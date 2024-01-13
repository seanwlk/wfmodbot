module.exports = {
  apps : [{
    name   : "modbot",
    namespace : "discord",
    script : "npm",
    args   : "start",
    env: {
      "DB_HOST": "",
      "DB_USER": "",
      "DB_PWD": "",
    }
  }]
}
