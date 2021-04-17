const webhook = require("webhook-discord");
const puppeteer = require("puppeteer");
const sources = require("sites.json");
const dest = require("channels.json");
const https = require('https');
fs = require('fs');


function download(url, imagename){
	https.get(url, (resp) => {
		let data = '';
		resp.setEncoding('binary');
		resp.on('data', (chunk) => {
			data += chunk;
		});
		resp.on('end', () => {
			fs.writeFile(imagename, data, 'binary', (err) => {
            if (err) throw err;
            console.log('File saved.');
      });
		});

	});
}

async function start(schedule, downloads){

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // loop here
    schedule.forEach(async function (){
	await page.goto();
	// download all the images for the day
	const data = await page.evaluate();
	download(data);
	downloads[""][""] = "";
    });

    browser.close();
};

// main function
(() => {
    let schedule = {};
    // parse the sites and channels
    
    // peform the function on loop on time
    let downloads = start(schedule);
    
})();

