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

async function start(schedule){

    let endpoint = "https://waifu.pics/api/" + schedule[key][sfw] + '/';
  		await https.get(endpoint, (resp) => {
  			let data = '';
  			resp.on('data', (chunk) => {
  			    data += chunk;
  			});

  			resp.on('end', () => {
  			    let imgData = JSON.parse(data);
  			    let url = imgData["url"];
            // regex for getting the file type extension
            let name = key + url.match(/\.[0-9a-z]+$/i);
  			    download(url, "./" + key, name);
  			});

  			resp.on('error', (err) => {
  			    console.log("Error: " + err.message);
  			});

  		});

};

async function driver(schedule){

  let tags = schedule[key][tags].match(/[^,]+/g); // array of tags

  /*
  for await(){

  }
  */
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
