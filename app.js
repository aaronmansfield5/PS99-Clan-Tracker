require('dotenv').config();
const express = require('express');
const { Save, Clans, Battles } = require('./clans');

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3000;

const save = new Save();

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 500, error: 'Something went wrong!' });
});

app.get('/clanbattle', async (req, res, next) => {
    try {
        const result = await save.client.query(`
            SELECT * FROM clan_battle_points
            ORDER BY clanid ASC, pph DESC;
        `);
        res.json({ status: 'ok', data: result.rows });
    } catch (error) {
        next(error);
    }
});

app.get('/clanbattle/:clanId', async (req, res, next) => {
    if (isNaN(req.params.clanId)) return next();

    const clanId = parseInt(req.params.clanId);
    const clan = new Clans(clanId)
    const clanData = await clan.Fetch()

    if (isNaN(clanId) || clanId < 1 || clanId > 5) {
        return res.status(400).json({ status: 400, error: 'Invalid clan ID. Please provide a clan ID between 1 and 5.' });
    }

    try {
        const result = await save.client.query(`
            SELECT * FROM clan_battle_points
            WHERE ClanId = $1
            ORDER BY pph DESC;
        `, [clanId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 404, error: 'No data found for the specified clan ID.' });
        }

        res.json({ status: 'ok', data: { "Name": clanData.Name, Members: result.rows } });
    } catch (error) {
        next(error);
    }
});

app.get('/clanbattle/inactive', async(req, res, next) => {
    try {
        const result = await save.client.query(`
            SELECT * FROM clan_battle_points
            WHERE (last_changed > 0 OR inactive_for > 0)
            ORDER BY clanid ASC, last_changed DESC;
        `);
        res.json({ status: 'ok', data: result.rows });
    } catch (error) {
        next(error);
    }
})

app.get('/clanbattle/inactive/:clanId', async(req, res, next) => {
    if (isNaN(req.params.clanId)) return next();

    const clanId = parseInt(req.params.clanId);
    const clan = new Clans(clanId)
    const clanData = await clan.Fetch()

    if (isNaN(clanId) || clanId < 1 || clanId > 5) {
        return res.status(400).json({ status: 400, error: 'Invalid clan ID. Please provide a clan ID between 1 and 5.' });
    }

    try {
        const result = await save.client.query(`
            SELECT * FROM clan_battle_points
            WHERE ClanId = $1 AND (last_changed > 0 OR inactive_for > 0)
            ORDER BY pph DESC;
        `, [clanId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 404, error: 'No data found for the specified clan ID.' });
        }

        res.json({ status: 'ok', data: { "Name": clanData.Name, Members: result.rows } });
    } catch (error) {
        next(error);
    }
})

app.get('/clanbattle/pph/:clanId', async(req, res, next) => {
    if (isNaN(req.params.clanId)) return next();

    const clanId = parseInt(req.params.clanId);
    const clan = new Clans(clanId)
    const clanData = await clan.Fetch()

    if (isNaN(clanId) || clanId < 1 || clanId > 5) {
        return res.status(400).json({ status: 400, error: 'Invalid clan ID. Please provide a clan ID between 1 and 5.' });
    }

    try {
        const result = await save.client.query(`
            SELECT pph FROM clan_battle_points
            WHERE ClanId = $1
            ORDER BY pph DESC;
        `, [clanId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 404, error: 'No data found for the specified clan ID.' });
        }

        const sum = result.rows.reduce((acc, obj) => acc + parseInt(obj.pph, 10), 0);
        const average = (sum / result.rows.length).toFixed(2);

        res.json({ status: 'ok', data: { "Name": clanData.Name, pph: { total: sum, average } } });
    } catch (error) {
        next(error);
    }
})

app.listen(HTTP_PORT, () => {
    console.log(`Server is running on http://localhost:${HTTP_PORT}`);
});