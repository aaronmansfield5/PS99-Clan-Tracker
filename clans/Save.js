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
                        ClanId BIGINT,
                        last_changed BIGINT NOT NULL DEFAULT 0,
                        inactive_for BIGINT NOT NULL DEFAULT 0
                    );
                `);
                console.log('Created clan_battle_points table.');
            }
        } catch (error) {
            console.error('Error checking or creating table:', error);
        }
    }

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
                    const timestamp = new Date().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                    console.log(`Data for Clan ID ${clanId} saved to database successfully. - ${timestamp}`); 
                }
            } catch (error) {
                console.error('Error during saving process:', error);
            }
        };

        await saveProcess();

        setInterval(saveProcess, 10 * 60 * 1000);
    }

    async saveDataToDatabase(OrderedList, ClanId) {
        try {
            for (const user of OrderedList) {
                const { UserID, Points } = user;
                const result = await this.client.query(
                    'SELECT Points, last_changed, inactive_for FROM clan_battle_points WHERE UserID = $1',
                    [UserID]
                );

                if (result.rows.length > 0) {
                    const { points: oldPoints, last_changed, inactive_for } = result.rows[0];

                    if (oldPoints !== Points && Points > oldPoints) {
                        const PPH = (Points - oldPoints) * 4;
                        await this.client.query(
                            'UPDATE clan_battle_points SET Points = $1, OldPoints = $2, PPH = $3, last_changed = 0, inactive_for = inactive_for + last_changed WHERE UserID = $4',
                            [Points, oldPoints, PPH, UserID]
                        );
                    } else {
                        await this.client.query(
                            'UPDATE clan_battle_points SET last_changed = last_changed + 600 WHERE UserID = $1',
                            [UserID]
                        );
                    }
                } else {
                    await this.client.query(
                        'INSERT INTO clan_battle_points (UserID, Points, OldPoints, PPH, ClanId, last_changed, inactive_for) VALUES ($1, $2, $3, $4, $5, 0, 0)',
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