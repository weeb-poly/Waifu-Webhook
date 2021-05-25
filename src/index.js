
const fs = require('fs');

const cron = require('./cron.js');
const waifu = require('./waifu.js');
const webhook = require('./webhook.js');

async function cronCallback(chanConf, tagsConf) {
  // pick a random tag
  let tagArray = chanConf['tags'];
  let tag = tagArray[Math.floor(Math.random() * tagArray.length)];

  // Fetch Image
  let imgURL;
  try {
    imgURL = await waifu.imgGet(tag, chanConf['type']);
  } catch (err) {
    console.log("Error:", err.message);
    return;
  }

  const emb = webhook.makeEmbed(imgURL, tagsConf);
  await webhook.sendMessage(chanConf, emb);
}

// this is the main function
(async () => {
  /* -- Parsing the json config files -- */
  // tags contains the configuration (colors + quotes) for each tag
  let tags = JSON.parse(fs.readFileSync('./config/tags.json'));
  // channels contains the configuration details of each webhook
  let channels = JSON.parse(fs.readFileSync('./config/channels.json'));
  // tokens contains the credentials of each webhook
  let tokens = JSON.parse(fs.readFileSync('./secrets/tokens.json'));

  // Schedule Cron-like Events for all Channels
  for (const channel of Object.keys(channels)) {
    // Combine the Channel config and the channel credentials
    let conf = Object.assign({}, channels[channel], tokens[channel]);

    // await cronCallback(conf, tags);
    cron.driver(conf, cronCallback.bind(null, conf, tags));
  }
})();
