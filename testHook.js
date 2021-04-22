const webhook = require("webhook-discord");
const https = require('https');
const util = require("util");

let testData = false;

async function getRequest(url, callback){
    await https.get(url, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        testData = true;
        callback(JSON.parse(data));
      });
      resp.on('error', (err) => {
        console.log("Error:" + err.message);
      });

    });
}

async function test(url){
  await getRequest(url, (data) => {
    const Hook = new webhook.Webhook(url);
    const msg = new webhook.MessageBuilder()
                  .setName(data["name"])
                  .setColor("#04ff00")
                  .setTitle("ara-ara")
                  .setAuthor("From Waifu.pics", "https://waifu.pics/favicon.png", "https://waifu.pics/")
                  .setImage("https://i.waifu.pics/ZV7J1WW.png")
                  .setFooter("star us on github:\nhttps://github.com/weeb-poly/Waifu-Webhook");
    Hook.send(msg);
  });

  console.log(testData);
}

/*
let test = new Webhook("This webhook is now deleted, nice try");
while(test.lock);
console.log("done");
*/
// Hook.send(new webhook.MessageBuilder().setName("WEBHOOK-NAME").setText("hello"));


const fetch = require('node-fetch');

(async () => {
  try {

    const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
    const json = await response.json()

    console.log(json["url"]);
    console.log(json.explanation);
  } catch (error) {
    console.log(error.response.body);
  }
})();
