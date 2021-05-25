const fetch = require('node-fetch');

async function imgGet(tag, sfw) {
  let endpoint = `https://api.waifu.pics/${sfw}/${tag}`;
  const imgData = await fetch(endpoint).then(res => res.json());

  let url = imgData['url'];

  return [tag, sfw, url];
}

module.exports = {
  imgGet
};
