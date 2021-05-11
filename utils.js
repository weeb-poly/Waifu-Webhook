const fetch = require('node-fetch');

async function imgGet(tag, sfw){
  try {
    let endpoint = "https://waifu.pics/api/" + sfw + '/' + tag;
    const response = await fetch(endpoint);
    const imgData = await response.json();

    let url = imgData["url"];
    return [tag, sfw, url];

  } catch (err) {
    console.log("Error:", err.message);
  }
}

// converts frequency to cron string
function cronCalc(frequency){
  // the number in the channel-token file says how many times per day
  switch(frequency){
    case "@day":
      return "0 0 13 * * *";
    case "@hour":
      return "0 * * * *";
    case "@minuite":
      return "* * * * *"
  }
}

module.exports = {imgGet, cronCalc};
