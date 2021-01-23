const FetchHandler = require('./fetchHandler');
const { MessageHandler, MAIN_LAYOUT, FIELD_LAYOUT } = require('./messageHandler');
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

const NUMBER_REACTS = {
  1: '1️⃣',
  2: '2️⃣',
  3: '3️⃣',
  4: '4️⃣',
  5: '5️⃣',
  6: '6️⃣',
  7: '7️⃣',
  8: '8️⃣',
  9: '9️⃣',
};

class Daily {
  constructor() {
    this.state = {
      lastPullDate: null,
      messageHandler: new MessageHandler(),
      games: [],
      gameData: null,
    };
  }

  async genSchedule(games, gameDate) {
    const layout = JSON.parse(JSON.stringify(MAIN_LAYOUT));
    const date = new Date(gameDate);
    layout.title = `Schedule for ${date.toLocaleDateString()}`;
    layout.desc = `There are ${games.totalGames} game${games.totalGames > 1 ? 's' : ''} today!`;
    layout.footer = 'Want further info? Click the # corresponding to the game';
    return layout;
  }

  async genGame(game) {
    const layout = JSON.parse(JSON.stringify(FIELD_LAYOUT));
    const date = new Date(moment(game.gameDate).format());
    layout.name = `${game.teams.away.team.name} @ ${game.teams.home.team.name}`;
    layout.value = `${game.venue.name} * ${date.toLocaleTimeString()} EST`;
    return layout;
  }

  async genTeamSpecifics(team) {
    const layout = JSON.parse(JSON.stringify(FIELD_LAYOUT));
    layout.name = `${team.team.name}`;
    layout.value = `${team.leagueRecord.wins} - ${team.leagueRecord.losses} - ${team.leagueRecord.ot}`;
    return layout;
  }

  async genGameSpecifics(game, channel) {
    const layout = JSON.parse(JSON.stringify(MAIN_LAYOUT));
    const away = game.teams.away;
    const home = game.teams.home;
    const date = new Date(game.gameDate);
    layout.title = `${away.team.name} @ ${home.team.name}`;
    layout.desc = `${game.venue.name} * ${date.toLocaleTimeString()} EST`;
    layout.fields.push(await this.genTeamSpecifics(away));
    layout.fields.push(await this.genTeamSpecifics(home));
    layout.footer = '';
    await this.state.messageHandler.channelSend(channel, layout);
  }

  async fetchGameDetails(emojiNumber, channel) {
    for (const [key, value] of Object.entries(NUMBER_REACTS)) {
      if (value === emojiNumber) {
        this.genGameSpecifics(this.state.games[key - 1], channel);
      }
    }
  }

  async handleDisplay(channel) {
    if (this.state.games.length !== 0 && this.stategameData !== null) {
      const games = [];
      const today = new Date();
      const dateFormat = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      this.state.games.forEach(async (game) => {
        games.push(await this.genGame(game));
      });
      const sched = await this.genSchedule(this.state.gameData, dateFormat);
      sched.fields = games;
      await this.state.messageHandler.channelSend(channel, sched);
    }
  }

  async fetchSchedule(channel, logger) {
    const today = new Date();
    if (today.getDate() === this.state.lastPullDate) {
      logger.info('Using info already obtained for today for schedule publish');
      this.handleDisplay(channel);
      return;
    }
    this.state.lastPullDate = today.getDate();
    const dateFormat = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    logger.info(`Making request to API for day ${dateFormat}`);
    const gameData = await FetchHandler.get(`${process.env.BASE_URL}/schedule`, `?date=${dateFormat}`, '');
    if (gameData.totalGames === 0) {
      logger.debug(`Found 0 games occurring on ${dateFormat}`);
      this.state.games = [];
      this.state.gameData = null;
    } else {
      logger.debug(`Found ${gameData.totalGames} games occurring on ${dateFormat}`);
      this.state.games = gameData.dates[0].games;
      this.state.gameData = gameData;
      this.handleDisplay(channel);
    }
  }
}

module.exports = Daily;
