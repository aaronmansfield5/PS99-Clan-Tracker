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
        this.Clans = [
            "K0ii",
            "K0i2",
            "K0i3",
            "K0i4",
            "K0i5"
        ];

        if (id >= this.Clans.length + 1 || id < 1) throw new Error("That clan ID is out of bounds!");

        this.Clan = this.Clans[id - 1];
    }

    /**
    * Fetches and returns clan data.
    *
    * @returns {Promise<{ body: JSON }>}
    */
    Fetch = async function() {
        if (!this.Clan) throw new Error("There is no current clan set!");

        const URL = `${process.env.BIG_GAMES}/clan/${this.Clan}`;
        const data = (await axios.get(URL)).data;

        if(!data) throw new Error("Error attempting to access BIG Games API!");
        if(data.status != "ok") throw new Error("Error attempting to access BIG Games API!");

        return data.data;
    }
}

module.exports = Clan