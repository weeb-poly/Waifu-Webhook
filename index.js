const webhook = require("webhook-discord");
const https = require('https');
fs = require('fs');
var LocalStorage = require('node-localstorage').LocalStorage,
let localStorage = new LocalStorage('./scratch');


function download(url, dir, imagename){
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);

    https.get(url, (resp) => {
		let data = '';
		resp.setEncoding('binary');
		resp.on('data', (chunk) => {
			data += chunk;
		});
		resp.on('end', () => {
			fs.writeFile(dir + '/' + imagename, data, 'binary', (err) => {
            if (err) throw err;
            console.log('File saved.');
      });
		});

	});
}

async function imgGet(server, number, tag, sfw){

    let endpoint = "https://waifu.pics/api/" + sfw + '/' + tag;

  	await https.get(endpoint, (resp) => {
  		let data = '';
  		resp.on('data', (chunk) => {
  		    data += chunk;
  		});

			resp.on('end', () => {
			    let imgData = JSON.parse(data);
			    let url = imgData["url"];

          // regex for getting the file type extension
          let name = tag + "_" + number + url.match(/\.[0-9a-z]+$/i);
			    download(url, "./" + server, name);
			});

			resp.on('error', (err) => {
			    console.log("Error: " + err.message);
			});

		});

};

// utility to get rid of all files in a directory
async function cleanup(dir){
  if(!fs.existsSync(dir)) return;
  fs.rmdir(dir, { recursive: true }).then(() => console.log(dir + ' removed'));
}

async function driver(channelConfig, endpoints){

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
  for await (let server of serverChannels){
    let number = 0;
    for await(let tag of images[server]){
      imgGet(server, number++, tag, channelConfig[server]["type"]);
    }
  }

  // webhook stuff


}

// this is the main function
(() => {
  /* -- Parsing the json config files -- */
  // channel config contains the prefrences for each channel
  let channelConfig = JSON.parse(fs.readFileSync("./config/channel-config.json"));
  // channel-tokens contains the actual urls, names, and images for each webhook
  let tokens = JSON.parse(fs.readFileSync('.config/channel-tokens.json'));
  // contains the last time images were gathered and the last time images were sent
  let postTime = JSON.parse(fs.readFileSync("./config/schedule.json");
  // contains quotes to display for each tag
  let quotes = JSON.parse(fs.readFileSync("./config/quotes.json"));

  /* --  -- */
})();
