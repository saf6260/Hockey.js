const fs = require('fs');
const { gatherPermissions } = require('../util');

const TITLE = 'Bot Configurations';
const DESC = 'Adjust how the bot works';
const FOOTER = 'Run other commands to update (see !help if needed)';
const { RESPONSE_FILE } = process.env;


module.exports = {
  name: 'config',
  description: 'Command for displaying the bot\'s system configurations for the guild',
  async execute(msg, _args, Guild, ownerID, handler, logger) {
    const guild = msg.channel.guild;
    const responseData = JSON.parse(fs.readFileSync(RESPONSE_FILE));
    const DBGuild = await Guild.prototype.findGuild(['ChannelID', 'Daily'], guild.id);
    if (DBGuild === undefined) {
      logger.error(`GuildID: ${guild.id} not in DB!`);
      handler.messageResponse(msg, responseData.errorExecution);
      return;
    }
    const channelID = DBGuild.get('ChannelID');
    let channelName;
    if (channelID === undefined || channelID === null) {
      channelName = 'Undefined. Please set this!';
    } else {
      channelName = guild.channels.cache.get(channelID);
    }
    const fields = [];
    fields.push(handler.genField('Announcement channel:', channelName, true));
    fields.push(handler.genField('Daily updates:', DBGuild.get('Daily') ? 'On' : 'Off', true));
    const rolePermissions = await gatherPermissions('any', Guild, guild.id);
    let systemRolePerms = '';
    rolePermissions.forEach((perm) => {
      const sysRole = guild.roles.cache.get(perm.dataValues.RoleID);
      systemRolePerms += (`${sysRole.name} has ${perm.dataValues.PermLevel} permissions\n`);
    });
    if (msg.author.id === ownerID) {
      fields.push(handler.genField('Permissions:', 'You have permissions to update'));
    } else {
      fields.push(handler.genField('Permissions:', 'Please talk to your server owner for setup'));
    }
    if (systemRolePerms !== '') {
      fields.push(handler.genField('Role Permissions:', systemRolePerms));
    }
    const resp = handler.genMain(TITLE, DESC, fields, FOOTER);
    handler.messageResponse(msg, resp);
  },
};
