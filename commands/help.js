const fs = require('fs');

const { RESPONSE_FILE } = process.env;

module.exports = {
  name: 'help',
  description: 'Support command for understanding bot execution',
  // eslint-disable-next-line no-unused-vars
  async execute(msg, _args, _Guild, _ownerID, handler, logger) {
    const responseData = JSON.parse(fs.readFileSync(RESPONSE_FILE));
    logger.debug(`Sending help response to guild ${msg.channel.guild.id}`);
    handler.messageResponse(msg, responseData.help);
  },
};