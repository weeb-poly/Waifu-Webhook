// const webhook = require("webhook-discord");
const https = require('https');
fs = require('fs');


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

async function start(server, number, tag, sfw){

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

async function driver(schedule){

  let serverChannels = Object.keys(schedule);
  let images = {};

  // gets all the images for each channel
  serverChannels.forEach((key, i) => {
    images[key] = [];
    let tags = schedule[key]["tags"].match(/[^,]+/g); // gets the tags each channels wants and puts it in an array
    for (let i = 0; i < schedule[key]["frequency"]; i++)
      images[key].push(tags[Math.floor(Math.random() * tags.length)]);
  });

  for await (let server of serverChannels){
    let number = 0;
    for await(let tag of images[server]){
      start(server, number++, tag, schedule[server]["type"]);
    }
  }

}

// this is the main function
(() => {
  let rawData = fs.readFileSync("./config/channels.json");
  let schedule = JSON.parse(rawData);
  driver(schedule);
})();

/* main function
(() => {
    let schedule = {};
    // parse the sites and channels

    // peform the function on loop on time
    let downloads = start(schedule);

})();
*/
