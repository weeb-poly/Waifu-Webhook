const cron = require('node-cron');

function cronDriver(channelConfig, callback) {
  let cronString = '';
  if ('cron' in conf) {
    cronString = channelConfig['cron'];
  } else if ('frequency' in conf) {
    cronString = cronCalc(channelConfig['frequency']);
  }

  cron.schedule(cronString, async () => {
    await callback();
  });
}

/**
 * converts frequency to cron string
 *
 * @param {string} freq - A string param
 * @return {string} Cron String
 *
 */
function cronCalc(frequency) {
  // the number in the channel-token file says how many times per day
  switch (frequency) {
    case "@daily":
      return "0 0 13 * * *";
    case "@hourly":
      return "0 * * * *";
    case "@perminute":
      return "* * * * *";
    default:
      return frequency;
  }
}

module.exports = {
  driver: cronDriver,
  calc: cronCalc
};
