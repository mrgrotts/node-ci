const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

module.exports = class PuppetFactory {
  static async build() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const App = new PuppetFactory(page);

    return new Proxy(App, { get: (target, property) => App[property] || browser[property] || page[property] });
  }

  constructor(page) {
    this.page = page;
  }

  async action(method, route, credentials, headers, body) {
    try {
      if (body) {
        return await this.page.evaluate(
          (method, path, credentials, headers, body) => fetch(path, { method, credentials, headers, body }).then(res => res.json()),
          method,
          route,
          credentials,
          headers,
          body
        );
      } else {
        return await this.page.evaluate(
          (method, path, credentials, headers) => fetch(path, { method, credentials, headers }).then(res => res.json()),
          method,
          route,
          credentials,
          headers
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async execute(actions) {
    try {
      return await Promise.all(actions.map(({ method, route, data }) => this.request(method, route, JSON.stringify(data))));
    } catch (error) {
      console.log(error);
    }
  }

  async inspect(selector) {
    return this.page.$eval(selector, element => element.innerHTML);
  }

  async login() {
    const user = await userFactory();
    const { session, signature } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: signature });
    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async request(method, route, data) {
    try {
      const credentials = 'same-origin';
      const headers = { 'Content-Type': 'application/json' };

      return await this.action(method, route, credentials, headers, data);
    } catch (error) {
      console.log(error);
    }
  }
};
