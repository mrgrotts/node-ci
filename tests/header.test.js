const PuppetFactory = require('./factories/puppetFactory');

let page;

beforeEach(async () => {
  page = await PuppetFactory.build();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
});

afterEach(async () => await page.close());

test('the header has the correct text', async () => {
  const text = await page.inspect('a.brand-logo');

  expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
  await page.login();

  const text = await page.inspect('a[href="/auth/logout"]');
  // const text = await page.$eval('a[href="/auth/logout"]', element => element.innerHTML);

  expect(text).toEqual('Logout');
});
