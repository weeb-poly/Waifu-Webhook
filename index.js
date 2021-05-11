const webhook = require("webhook-discord");
const utils = require("./utils.js");
const cron = require('node-cron');
const fs = require('fs');

async function sendMessage(channelConfig, channel, quotes, imgURL, colors){

  let tag = imgURL[0];
  let sfw = imgURL[1];
  let url = imgURL[2];

  console.log(sfw);

  let quoteArray = (tag in quotes) ? quotes[tag][sfw] : quotes["generic"][sfw];
  let tagColor = (tag in colors) ? colors[tag] : colors["default"];

  // generate quote
  let quoteToSend = quoteArray[Math.floor(Math.random() * quoteArray.length)];
  console.log(quoteToSend);
  // actual webhook
  const Hook = new webhook.Webhook(channelConfig[channel]["endpoint"]);
  const msg = new webhook.MessageBuilder()
                .setName(channelConfig[channel]["name"])
                .setColor(tagColor)
                .setTitle(quoteToSend)
                .setAuthor("From Waifu.pics", "https://waifu.pics/favicon.png", "https://waifu.pics/")
                .setImage(url)
                .setDescription("[Star us on Github!](https://github.com/weeb-poly/Waifu-Webhook)");

  Hook.send(msg);
}

async function driver(channelConfig, channel, quotes, colors, cronString){

  // gets all the images for each channel
  let tagArray = channelConfig[channel]["tags"].match(/[^,]+/g);

  // downloads all images
  cron.schedule(cronString, async () => {
    let tag = tagArray[Math.floor(Math.random() * tagArray.length)]; // pick a random tag
    let imgURL = await utils.imgGet(tag, channelConfig[channel]["type"]);
    sendMessage(channelConfig, channel, quotes, imgURL, colors);
  });
}

// this is the main function
(() => {
  /* -- Parsing the json config files -- */
  // channel-tokens contains the actual urls, names, and images for each webhook
  let tokens = JSON.parse(fs.readFileSync("./config/channel-tokens.json"));
  // contains quotes to display for each tag
  let quotes = JSON.parse(fs.readFileSync("./config/quotes.json"));
  // containst the colors for each tag
  let colors = JSON.parse(fs.readFileSync("./config/colors.json"));

  /* -- -- */
  // await sendMessage(channelConfig, quotes, schedule);
  Object.keys(tokens).forEach((key) => {
    let cronString = utils.cronCalc(tokens[key]["frequency"]);
    driver(tokens, key, quotes, colors, cronString);
  });

})();
