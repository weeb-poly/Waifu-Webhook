const webhook = require("webhook-discord");
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
	Object.keys(schedule).forEach((key) => {
		await https.get("https://waifu.pics/api/", () => {
			let data = '';
			resp.on('data', (chunk) = > {
				data += chunk;
			});

			resp.on('end', () => {
				let imgData = JSON.parse(data);
				let url = imgData["url"];

				download(url, name));
			});

			resp.on('error', (err) => {
				console.log("Error: " + err.message);
			});

		});
	});

};

// main function
(() => {
    let schedule = {};
    // parse the sites and channels

    // peform the function on loop on time
    let downloads = start(schedule);

})();
