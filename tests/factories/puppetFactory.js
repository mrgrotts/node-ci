const puppeteer = require('puppeteer');
const sessionFactory = require('./sessionFactory');
const userFactory = require('./userFactory');

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

  async action(method, route, data) {
    try {
      const credentials = 'same-origin';
      const headers = { 'Content-Type': 'application/json' };

      return await this.request(method, route, credentials, headers, JSON.stringify(data));
    } catch (error) {
      console.log(error);
    }
  }

  async execute(actions) {
    try {
      return await Promise.all(actions.map(({ method, route, data }) => this.action(method, route, data)));
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

  request(method, path, credentials, headers, body) {
    try {
      if (body) {
        // some of our arguments get transformed here
        // console.log(method, path, credentials, headers, body);
        return this.page.evaluate(
          async (method, path, credentials, headers, body) => {
            const response = await fetch(path, { method, credentials, headers, body });
            return response.json();
          },
          method,
          path,
          credentials,
          headers,
          body
        );
      } else {
        // some of our arguments get transformed here
        // console.log(method, path, credentials, headers, body);
        return this.page.evaluate(
          async (method, path, credentials, headers) => {
            const response = await fetch(path, { method, credentials, headers });
            return response.json();
          },
          method,
          path,
          credentials,
          headers
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
};
