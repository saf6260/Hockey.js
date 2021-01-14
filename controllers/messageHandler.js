const Discord = require('discord.js');

const MAIN_LAYOUT = {
  title: '',
  desc: '',
  fields: [],
  footer: '',
};

const FIELD_LAYOUT = {
  name: '',
  value: '',
  inline: false,
};

class MessageHandler {

  static embedBuilder(title, desc, fields, footer) {
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(title)
      .setDescription(desc)
      .addFields(fields)
      .setTimestamp()
      .setFooter(footer);
    return embed;
  }

  genMain(title, desc, fields, footer) {
    return {
      title,
      desc,
      fields,
      footer,
    };
  }

  genField(name, value, inline = false) {
    return {
      name,
      value,
      inline,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  messageResponse(msg, data) {
    const embed = MessageHandler.embedBuilder(data.title, data.desc,
      data.fields, data.footer);
    msg.reply(embed);
  }

  channelSend(channel, data) {
    const embed = MessageHandler.embedBuilder(data.title, data.desc,
      data.fields, data.footer);
    return channel.send(embed);
  }

  // eslint-disable-next-line class-methods-use-this
  async dmMessageResponse(user, data) {
    const embed = MessageHandler.embedBuilder(data.title, data.desc,
      data.fields, data.footer);
    return user.send(embed);
  }

  static imageMessageHandler(user, url) {
    // Color #B22222 = "FireBrick"
    const embed = new Discord.MessageEmbed()
      .setColor('#B22222')
      .setImage(url);
    return user.send(embed);
  }
}

module.exports = {
  MessageHandler,
  MAIN_LAYOUT,
  FIELD_LAYOUT,
};
