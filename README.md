# PS99 Clan Tracker

PS99 Clan Tracker is a powerful automation tool built using Node.js, PostgreSQL, and the BIG Games API. This bot manages clan battle data, fetches current battle statuses, and stores the player statistics in a PostgreSQL database. It's designed for efficiently processing and saving player points during ongoing clan battles, enabling easy access to the data for analysis or further automation.

<a href="https://github.com/aaronmansfield5/PS99-Clan-Tracker/issues">![Issues](https://img.shields.io/github/issues/aaronmansfield5/PS99-Clan-Tracker)</a>
<a href="https://github.com/aaronmansfield5/PS99-Clan-Tracker/stargazers">![GitHub stars](https://img.shields.io/github/stars/aaronmansfield5/PS99-Clan-Tracker)</a>
<a href="https://github.com/aaronmansfield5/PS99-Clan-Tracker/forks">![GitHub forks](https://img.shields.io/github/forks/aaronmansfield5/PS99-Clan-Tracker)</a>

## Prerequisites

- <a href="https://nodejs.org/en">![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)</a>
- <a href="https://www.npmjs.com/">![NPM](https://img.shields.io/badge/npm-CB3837?style=flat&logo=npm&logoColor=white)</a>
- <a href="https://www.postgresql.org/">![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0064A5?style=flat&logo=postgresql&logoColor=white)</a>
- <a href="https://docs.biggamesapi.io/">![BIG Games API](https://img.shields.io/badge/BIG_Games_API-4285F4?style=flat&logo=google-cloud&logoColor=white)</a>

## Installation

1. Clone the repository:

```bash
git clone https://github.com/aaronmansfield5/PS99-Clan-Tracker.git
```

2. Install the dependencies:
```bash
cd PS99-Clan-Tracker
npm install axios pg dotenv
```

3. Set up environment variables in the `.env` file:
```makefile
# Discord Bot Token
BOT_TOKEN=<YOUR_BOT_TOKEN>

# BIG Games API URL
BIG_GAMES=https://ps99.biggamesapi.io/api

# Database Config
DB_USER=<YOUR_DB_USER>
DB_HOST=<YOUR_DB_HOST>
DB_NAME=<YOUR_DB_NAME>
DB_PASSWORD=<YOUR_DB_PASSWORD>
DB_PORT=<YOUR_DB_PORT>

# HTTP Config
HTTP_PORT=<YOUR_HTTP_PORT>
```

4. Set up clans in the `Clans.js` file:
```js
this.Clans = [
    "CLAN1",
    "CLAN2"
];
```

## Usage

1. Start the bot:
```bash
node app.js
```

2. The bot will periodically fetch and store the player points data for multiple clans in the database, updating their stats based on the ongoing battle results.

3. Monitor the periodic save process, which occurs every 15 minutes, processing data for clans with IDs from 1 to 5.

## Modules

### Battles.js

This module manages the process of fetching and handling clan battle data. It fetches the current battle data for a given clan and orders the battle points data for all players within that clan, sorting them in descending order of their points.

### Save.js

This module handles connecting to the PostgreSQL database, checking if the clan_battle_points table exists, and creating it if necessary. It also handles saving the battle data to the database every 5 minutes. It fetches and processes battle data, then updates or inserts player stats accordingly.

## Contributing

Feel free to submit issues and pull requests for improvements, bug fixes, or new features.
