const webhook = require("webhook-discord");
const fetch = require('node-fetch');
const cron = require('node-cron');
const fs = require('fs');

function record(dir, name, data){
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  fs.writeFile(dir + '/' + name + ".json", JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log(name, 'File saved.');
  });
}

async function imgGet(server, number, tag, sfw){
  try {
    let endpoint = "https://waifu.pics/api/" + sfw + '/' + tag;
    const response = await fetch(endpoint);
    const imgData = await response.json();

    let url = imgData["url"];
    let name = number + "_" + tag + url.match(/\.[0-9a-z]+$/i);
    return [server, name, url];

  } catch (err) {
    console.log("Error:", err.message);
  }
};

async function sendMessage(channelConfig, quotes, schedule){
  Object.keys(channelConfig).forEach((key, i) => {

    let safe = channelConfig[key]["type"];

    console.log(safe);

    let imageDataArray = schedule[key]["images"].shift();
    let tag = imageDataArray[0].match(/[a-z]+[^\.]/)[0];
    let quoteArray = [];

    if (tag in quotes) {
      quoteArray = quotes[tag][safe];
    } else {
      quoteArray = quotes["generic"][safe];
    }

    // generate quote
    let quoteToSend = quoteArray[Math.floor(Math.random() * quoteArray.length)];
    console.log(quoteToSend);

    // actual webhook
    const Hook = new webhook.Webhook(channelConfig[key]["endpoint"]);
    const msg = new webhook.MessageBuilder()
                  .setName(channelConfig[key]["name"])
                  .setColor('#04ff00')
                  .setTitle(quoteToSend)
                  .setAuthor("From Waifu.pics", "https://waifu.pics/favicon.png", "https://waifu.pics/")
                  .setImage(imageDataArray[1])
                  .setDescription("[Star us on Github!](https://github.com/weeb-poly/Waifu-Webhook)");

    Hook.send(msg);
  });
}

async function driver(channelConfig, quotes){

  let serverChannels = Object.keys(channelConfig);
  let images = {};

  // gets all the images for each channel
  serverChannels.forEach((key, i) => {
    images[key] = [];
    let tags = channelConfig[key]["tags"].match(/[^,]+/g); // gets the tags each channels wants and puts it in an array
    for (let i = 0; i < channelConfig[key]["frequency"]; i++)
      images[key].push(tags[Math.floor(Math.random() * tags.length)]);
  });

  // downloads all images
  let promiseTable = [];
  for (let server of serverChannels){
    let number = 0;
    for (let tag of images[server]){
      promiseTable.push(imgGet(server, number++, tag, channelConfig[server]["type"]));
    }
  }

  // wait for all images to be recieved
  let imageURL = await Promise.all(promiseTable);
  let schedule = {};

  imageURL.forEach(([server, imageName, url], i) => {
    let pair = [imageName, url];

    // TODO: update the schedule if there are places there that are not there before
    if (!(server in schedule)){
      schedule[server] = {"images": []};
      schedule[server]["number"] = 0;
    }

    schedule[server]["images"].push(pair);
    schedule[server]["number"]++;
  });
  await sendMessage(channelConfig, quotes, schedule);
  return schedule;
}

// this is the main function
(async () => {
  /* -- Parsing the json config files -- */
  // channel-tokens contains the actual urls, names, and images for each webhook
  let tokens = JSON.parse(fs.readFileSync("./config/channel-tokens.json"));
  // contains quotes to display for each tag
  let quotes = JSON.parse(fs.readFileSync("./config/quotes.json"));

  /* --  -- */
  // await sendMessage(channelConfig, quotes, schedule);

  cron.schedule("*/2 * * * *", () => {
    driver(tokens, quotes);
  });

  // write the new schedule
  // start webhook cron job
  // sendMessage(tokens, channelConfig, quotes);
})();
