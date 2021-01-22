const fs = require('fs');
const { checkConfigLevel } = require('../util');
const { RESPONSE_FILE } = process.env;

module.exports = {
  name: 'daily',
  description: 'Command for toggling daily schedule updates',
  async execute(msg, args, Guild, ownerID, handler, logger) {
    const guild = msg.channel.guild;
    const responseData = JSON.parse(fs.readFileSync(RESPONSE_FILE));
    if (ownerID !== msg.author.id && !checkConfigLevel(msg, Guild, guild.id, logger)) {
      logger.debug(`${msg.author.username} doesn't have adequate permissions for daily command`);
      handler.messageResponse(msg, responseData.errorPermissions);
      return;
    }
    const header = 'HAWKEY YES?';
    const desc = 'Daily update made!';
    const footer = 'Use !config to see more info :)';
    const fields = [];
    if (args.length > 0) {
      if (args[0] === '-h') {
        await handler.messageResponse(msg, responseData.dailyHelp);
        return;
      } else {
        if (!args[0].includes(':')) {
          logger.debug(`${msg.author.username} sent invalid time ${args[0]}`);
          await handler.messageResponse(msg, responseData.errorParams);
          return;
        }
        logger.debug(`${msg.author.username} attempting to set time to ${args[0]} for daily in guild ${guild.id}`);
        const date = new Date();
        const [hours, minutes] = args[0].split(':');
        // eslint-disable-next-line yoda
        if (-1 >= parseInt(hours) || parseInt(hours) >= 24 || -1 >= parseInt(minutes)
          || parseInt(minutes) >= 60 || isNaN(hours) || isNaN(minutes)) {
          logger.debug(`${msg.author.username} sent invalid time ${args[0]}`);
          await handler.messageResponse(msg, responseData.errorParams);
          return;
        }
        date.setHours(hours, minutes, 0);
        Guild.prototype.setDailyTime(guild.id, date.toUTCString());
        fields.push(handler.genField('Adjustments:', `Daily time set to ${date.toTimeString()}`));
      }
    } else {
      logger.debug(`${msg.author.username} attempting to toggle daily in guild ${guild.id}`);
      await Guild.prototype.toggleDaily(guild.id);
      const dailyInfo = await Guild.prototype.getDaily(guild.id);
      const dateInfo = new Date(dailyInfo.get('DailyTime'));
      logger.info(`${msg.author.username} toggled daily to ${dailyInfo.get('Daily')} in guild ${guild.id}`);
      const dailyConfig = dailyInfo.get('Daily') ? `On @ ${dateInfo.toTimeString()}` : 'Off';
      fields.push(handler.genField('Adjustments:', `Daily set to ${dailyConfig}`));
      fields.push(handler.genField('Note:', 'If a schedule hasn\'t been sent today, it may take up to 15 mins to send'));
    }
    await handler.messageResponse(msg, handler.genMain(header, desc, fields, footer));
  },
};
