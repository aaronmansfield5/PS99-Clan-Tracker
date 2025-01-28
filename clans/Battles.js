require('dotenv').config()
const axios = require('axios')

/**
 * Class for managing clan battles.
 *
 * @returns {Battle}
 */
class Battle {
    constructor() {
        
    }

    /**
    * Fetches and returns clan battle data.
    *
    * @param {JSON} ClanData - Clan data, found at Clan.Fetch().
    * @returns {Promise<{ body: JSON }>}
    */
    CurrentBattle = async function(ClanData) {
        if (!ClanData) throw new Error("Malformed or invalid clan data!");

        const URL = `${process.env.BIG_GAMES}/activeClanBattle`;
        const data = (await axios.get(URL)).data;

        if(!data) throw new Error("Error attempting to access BIG Games API!");
        if(data.status != "ok") throw new Error("Error attempting to access BIG Games API!");
        if (!ClanData.Battles) throw new Error("Malformed or invalid clan data!");

        const Battle = data.data.configName;
        const ClanBattle = ClanData.Battles[Battle];

        if(!ClanBattle) throw new Error("Malformed or invalid clan data!");

        return ClanBattle;
    }

    /**
    * Fetches and returns ordered battle points data for all players in a clan.
    *
    * @param {JSON} ClanData - Clan data, found at Clan.Fetch().
    * @returns {Promise<{ body: JSON }>}
    */
    OrderedList = async function(ClanData) {
        if (!ClanData) throw new Error("Malformed or invalid clan data!");

        const ClanBattle = await this.CurrentBattle(ClanData);

        if(!ClanBattle) throw new Error("Malformed or invalid clan data!");

        const PointContributions = ClanBattle.PointContributions;

        if(!PointContributions) throw new Error("Malformed or invalid clan data!");

        return PointContributions.sort((a, b) => b.Points - a.Points);
    }
}

module.exports = Battle