const express = require('express');
const router = express.Router();
const discordbot = require('../src/classes/discordbot');

/* GET home page. */

router.get('/', function (req, res, next) {
    res.send("Hello World! - This is the API for the Discord Bot! This is a test!");
});

router.get('/getServers', async function (req, res, next) {
    let response = discordbot.collectData();
    res.send(response);
});

router.post("/sendMessage", async function (req, res, next) {
    let body = req.body

    let response = await discordbot.sayStuff(body.channel, body.message);
    console.log(response);
    res.status(200).send("Send Message - Success!");
});

router.post("/sendDM", async function (req, res, next) {
    let body = req.body

    let response = await discordbot.sendDM(body.userID, body.message);
    console.log(response);
    res.status(200).send("Send Message - Success!");
});

router.post("/sendDMEmbed", async function (req, res, next) {
    let body = req.body;

    let response = await discordbot.sendDMEmbed(body.userID, body.colour, body.title, body.description, body.footer, body.author, body.imageURL, body.subcategories);
    console.log(response);
    res.status(200).send("Send Embed - Success!")
});

router.get("/fetchDMs", async function (req, res, next) {
    let userID = req.query.userID;

    let response = await discordbot.fetchDMs(userID);
    res.status(200).send(response);
});

router.post("/sendEmbed", async function (req, res, next) {
    let body = req.body;

    let response = await discordbot.sendEmbed(body.channel, body.colour, body.title, body.description, body.subcategories);
    console.log(response);
    res.status(200).send("Send Embed - Success!")
});

router.get("/collectMessages", async function (req, res, next) {
    let channelID = req.query.channelID
    let limit = Number(req.query.limit) || 100
    let response = await discordbot.messageCollector(channelID, limit);
    res.send(response)
});

router.get("/kickUser", async function (req, res, next) {
    let userID = req.query.userID
    let guildID = req.query.guildID
    let response = await discordbot.kickuser(userID, guildID);
    res.send(response)
});

router.get("/banUser", async function (req, res, next) {
    let userID = req.query.userID
    let guildID = req.query.guildID
    let response = await discordbot.banuser(userID, guildID);
    res.send(response)
});

module.exports = router;