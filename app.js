require('dotenv').config();
const express = require('express');
const { Save, Clans, Battles } = require('./clans');

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3000;

const save = new Save();

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/clanbattle', async (req, res, next) => {
    try {
        const result = await save.client.query(`
            SELECT * FROM clan_battle_points
            ORDER BY clanid ASC, pph DESC;
        `);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.get('/clanbattle/:clanId', async (req, res, next) => {
    const clanId = parseInt(req.params.clanId);

    if (isNaN(clanId) || clanId < 1 || clanId > 5) {
        return res.status(400).json({ error: 'Invalid clan ID. Please provide a clan ID between 1 and 5.' });
    }

    try {
        const result = await save.client.query(`
            SELECT * FROM clan_battle_points
            WHERE ClanId = $1
            ORDER BY pph DESC;
        `, [clanId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No data found for the specified clan ID.' });
        }

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.listen(HTTP_PORT, () => {
    console.log(`Server is running on http://localhost:${HTTP_PORT}`);
});