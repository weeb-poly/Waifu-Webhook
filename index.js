const webhook = require("webhook-discord");
const fetch = require('node-fetch');
// var cron = require('node-cron');
fs = require('fs');

function record(dir, name, data){
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
		fs.writeFile(dir + '/' + name + ".json", JSON.stringify(data), (err) => {
          if (err) throw err;
          console.log(name + ' File saved.');
    });

}

async function imgGet(server, number, tag, sfw){

    try{
      let endpoint = "https://waifu.pics/api/" + sfw + '/' + tag;
      const response = await fetch(endpoint);
      const imgData = await response.json();

      let url = imgData["url"];
      let name = number + "_" + tag + url.match(/\.[0-9a-z]+$/i);
      return [server, name, url];

    } catch (err){
      console.log("Error: " + err.message);
    }
};

async function sendMessage(endpoints, channelConfig, quotes, schedule){
  Object.keys(endpoints).forEach((key, i) => {

    let safe = channelConfig[key]["type"];
    console.log(safe);
    let imageDataArray = schedule[key]["images"].shift();
    let tag = imageDataArray[0].match(/[a-z]+[^\.]/)[0];
    let quoteArray = [];
    if (tag in quotes){
      quoteArray = quotes[tag][safe];
    } else {
      quoteArray = quotes["generic"][safe];
    }
    // generate quote
    let quoteToSend = quoteArray[Math.floor(Math.random() * quoteArray.length)];
    console.log(quoteToSend);

    // actual webhook
    const Hook = new webhook.Webhook(endpoints[key]["endpoint"]);
    const msg = new webhook.MessageBuilder()
                  .setName(endpoints[key]["name"])
                  .setColor('#04ff00')
                  .setTitle(quoteToSend)
                  .setAuthor("From Waifu.pics", "https://waifu.pics/favicon.png", "https://waifu.pics/")
                  .setImage(imageDataArray[1])
                  .setFooter("star us on github:\nhttps://github.com/weeb-poly/Waifu-Webhook");
    Hook.send(msg);

  });

}

async function driver(channelConfig, endpoints, schedule, quotes){

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
  schedule["images-gathered"] = Date.now();
  
  imageURL.forEach((triple, i) => {
    let pair = [triple[1], triple[2]];
    schedule[triple[0]]["images"].push(pair);
    if (schedule[triple[0]]["start-time"] < Date.now() + 120)
      schedule[triple[0]]["starttime"] = Date.now() + 120

  });

  await sendMessage(endpoints, channelConfig, quotes, schedule);
  return schedule;

}

// this is the main function
(() => {
  /* -- Parsing the json config files -- */
  // channel config contains the prefrences for each channel
  let channelConfig = JSON.parse(fs.readFileSync("./config/channel-config.json"));
  // channel-tokens contains the actual urls, names, and images for each webhook
  let tokens = JSON.parse(fs.readFileSync("./config/channel-tokens.json"));
  // contains the last time images were gathered and the last time images were sent
  let postTime = JSON.parse(fs.readFileSync("./config/schedule.json"));
  // contains quotes to display for each tag
  let quotes = JSON.parse(fs.readFileSync("./config/quotes.json"));

  /* --  -- */
  driver(channelConfig, tokens, postTime, quotes);

  // write the new schedule
  // start webhook cron job
  // sendMessage(tokens, channelConfig, quotes);

})();
