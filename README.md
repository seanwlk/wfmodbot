# wfmodbot
Discord moderation bot for the official Warface Server

## Configuration
The configuration fully resides in the database config table. At startup the bot will be initialized with the three enviroment variables **DB_HOST**, **DB_USER** and **DB_PWD**. 

Available database config variables:
- bot_token
- prefix
- MAIN_SERVER
- ERROR_CHANNEL : id of the error channel (in the DEV server)
- Moderator : name of the moderator role in the server
- Admin : name of the administrator role in the server
- mute_role : name of the mute role in the server
- DEV_SERVER : id of the DEV server, for error logs mostly
- webapp_url
- bot_token_dev

## Database
Runs on Mysql/MariaDB. Schema available here: https://gist.github.com/seanwlk/d21f8eb2e89d9461e467f362c631df13

## Dashboard
The bot is fully integrated with the dashboard https://github.com/seanwlk/wfmodbot-dashboard