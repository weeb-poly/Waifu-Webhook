const { WebhookClient, MessageEmbed } = require('discord.js');

function makeEmbed(imgURL, tagsConf) {
  let [tag, sfw, url] = imgURL;

  let tagConf = Object.assign({}, tagsConf['default']);
  if (tag in tagsConf) {
    tagConf = Object.assign(tagConf, tagsConf[tag]);
  }

  // If no NSFW Quotes, just use the SFW ones
  if (tagConf['nsfw_quotes'].length === 0) {
    tagConf['nsfw_quotes'] = tagConf['sfw_quotes'];
  }

  let quoteArray = tagConf[`${sfw}_quotes`];
  let tagColor = tagConf['color'];

  // Chose Random Quote
  let quoteToSend = quoteArray[Math.floor(Math.random() * quoteArray.length)];

  // Embed
  return new MessageEmbed({
    title: quoteToSend,
    description: "[Star us on Github!](https://github.com/weeb-poly/Waifu-Webhook)",
    color: tagColor,
    author: {
      name: "From Waifu.pics",
      url:  "https://waifu.pics/",
      iconURL: "https://waifu.pics/favicon.png"
    },
    image: {
      url: url,
    }
  });
}

async function sendMessage(chanConf, embed) {
  // actual webhook
  const hook = new WebhookClient(chanConf["id"], chanConf["token"]);

  await hook.send({
    username: chanConf["name"],
    embeds: [embed]
  });
}

module.exports = {
  makeEmbed,
  sendMessage
};
