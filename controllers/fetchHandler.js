const fetch = require('node-fetch');

class FetchHandler {
  static get(route, params, method) {
    return fetch(`${route}${params}`)
      .then((res) => {
        if (res.ok) {
          if (method === 'text') {
            return res.text();
          }
          return res.json();
        }
        throw (res.statusText);
      });
  }
}

module.exports = FetchHandler;
