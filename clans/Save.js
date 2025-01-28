require('dotenv').config();
const { Client } = require('pg');
const Battles = require('./Battles.js');
const Clans = require('./Clans.js');

class Save {
    constructor() {
        this.client = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });

        this.client.connect()
            .then(async () => {
                console.log('Connected to the database');
                await this.checkAndCreateTable();
                this.startSaving();
            })
            .catch(err => console.error('Connection error', err.stack));
    }

    /**
     * Checks if the `clan_battle_points` table exists, and creates it if it doesn't.
     */
    async checkAndCreateTable() {
        try {
            const tableExists = await this.client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'clan_battle_points'
                );
            `);

            if (!tableExists.rows[0].exists) {
                await this.client.query(`
                    CREATE TABLE clan_battle_points (
                        UserID BIGINT PRIMARY KEY,
                        Points BIGINT NOT NULL,
                        OldPoints BIGINT NOT NULL,
                        PPH BIGINT,
                        ClanId BIGINT
                    );
                `);
                console.log('Created clan_battle_points table.');
            }
        } catch (error) {
            console.error('Error checking or creating table:', error);
        }
    }

    /**
     * Starts the periodic saving process every 5 minutes for all clans.
     */
    async startSaving() {
        const saveProcess = async () => {
            try {
                for (let clanId = 1; clanId <= 5; clanId++) {
                    console.log(`Processing Clan ID: ${clanId}`);
                    const Battle = new Battles();
                    const Clan = new Clans(clanId);
                    const ClanData = await Clan.Fetch();
                    const OrderedList = await Battle.OrderedList(ClanData);
    
                    await this.saveDataToDatabase(OrderedList, clanId);
                    console.log(`Data for Clan ID ${clanId} saved to database successfully.`);
                }
            } catch (error) {
                console.error('Error during saving process:', error);
            }
        };
    
        await saveProcess();
    
        setInterval(saveProcess, 15 * 60 * 1000);
    }

    /**
     * Saves the OrderedList data to the SQL database.
     *
     * @param {Array} OrderedList - The ordered list of user points.
     */
    async saveDataToDatabase(OrderedList, ClanId) {
        try {
            for (const user of OrderedList) {
                const { UserID, Points } = user;
    
                const result = await this.client.query(
                    'SELECT Points FROM clan_battle_points WHERE UserID = $1',
                    [UserID]
                );
    
                if (result.rows.length > 0) {
                    const oldPoints = result.rows[0].points;
                    if (oldPoints !== Points && Points > oldPoints) {
                        const PPH = (Points - oldPoints) * 4;
                        await this.client.query(
                            'UPDATE clan_battle_points SET Points = $1, OldPoints = $2, PPH = $3 WHERE UserID = $4',
                            [Points, oldPoints, PPH, UserID]
                        );
                    }
                } else {
                    await this.client.query(
                        'INSERT INTO clan_battle_points (UserID, Points, OldPoints, PPH, ClanId) VALUES ($1, $2, $3, $4, $5)',
                        [UserID, Points, 0, 0, ClanId]
                    );
                }
            }
    
            await this.client.query(
                'DELETE FROM clan_battle_points WHERE ClanId = $1 AND UserID NOT IN (' + OrderedList.map(u => u.UserID).join(', ') + ')',
                [ClanId]
            );
    
        } catch (error) {
            console.error('Error saving data to database:', error);
        }
    }    
}

module.exports = Save;