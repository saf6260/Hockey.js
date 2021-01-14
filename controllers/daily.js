const FetchHandler = require('./fetchHandler');
const { MessageHandler, MAIN_LAYOUT, FIELD_LAYOUT } = require('./messageHandler');

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
      messageHandler: new MessageHandler(),
      games: [],
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
    const date = new Date(game.gameDate);
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

  async fetchSchedule(channel) {
    const gameData = await FetchHandler.get(`${process.env.BASE_URL}/schedule`, '?date=2021-01-13', '');
    if (gameData.totalGames !== 0) {
      const games = [];
      gameData.dates[0].games.forEach(async (game) => {
        games.push(await this.genGame(game));
      });
      const sched = await this.genSchedule(gameData, '2021-01-13');
      sched.fields = games;
      this.state.games = gameData.dates[0].games;
      await this.state.messageHandler.channelSend(channel, sched)
        .then((msg) => {
          games.forEach((_, i) => {
            msg.react(NUMBER_REACTS[i + 1]);
          });
        });
    }

  }
}

module.exports = Daily;
