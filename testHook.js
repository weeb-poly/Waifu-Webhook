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

test("https://discord.com/api/webhooks/833124330618486824/lp6sA3nBlatOkf7tl-cqNPD1kgi9De4S1A-mxBBv3vy57IpWuUperEQC69H6pqe-22Lq");
/*
let test = new Webhook("https://discord.com/api/webhooks/833124330618486824/lp6sA3nBlatOkf7tl-cqNPD1kgi9De4S1A-mxBBv3vy57IpWuUperEQC69H6pqe-22Lq");
while(test.lock);
console.log("done");
*/
// Hook.send(new webhook.MessageBuilder().setName("WEBHOOK-NAME").setText("hello"));
