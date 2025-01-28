require('dotenv').config()
const axios = require('axios')

/**
 * Class for managing clans.
 *
 * @param {string} id - ID for current clan 1 - 6
 * @returns {Clan}
 */
class Clan {
    constructor(id) {
        this._Clans = [
            "CLAN1",
            "CLAN2"
        ];

        if (id >= this._Clans.length + 1 || id < 1) throw new Error("That clan ID is out of bounds!");

        this._Clan = this._Clans[id - 1];
    }

    /**
     * Returns all currently tracked clans.
     *
     * @returns {Array}
    */
    get Clans() {
        return this._Clans;
    }

    /**
    * Fetches and returns clan data.
    *
    * @returns {Promise<{ body: JSON }>}
    */
    Fetch = async function() {
        if (!this._Clan) throw new Error("There is no current clan set!");

        const URL = `${process.env.BIG_GAMES}/clan/${this._Clan}`;
        const data = (await axios.get(URL)).data;

        if(!data) throw new Error("Error attempting to access BIG Games API!");
        if(data.status != "ok") throw new Error("Error attempting to access BIG Games API!");

        return data.data;
    }
}

module.exports = Clan