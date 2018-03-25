const PuppetFactory = require('./factories/puppetFactory');

let page;

beforeEach(async () => {
  page = await PuppetFactory.build();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
});

afterEach(async () => await page.close());

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create form', async () => {
    const label = await page.inspect('form label');

    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.inspect('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.inspect('.card-title');
      const content = await page.inspect('p');

      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('the form shows an error message', async () => {
      const titleError = await page.inspect('.title .red-text');
      const contentError = await page.inspect('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      route: '/api/blogs'
    },
    {
      method: 'post',
      route: '/api/blogs',
      data: {
        title: 'T',
        content: 'C'
      }
    },
    {
      method: 'get',
      route: '/api/blogs/5ab7431b5751451c3cc43443'
    },
    {
      method: 'put',
      route: '/api/blogs/5ab7431b5751451c3cc43443',
      data: {
        title: 'Title',
        content: 'Content'
      }
    },
    {
      method: 'delete',
      route: '/api/blogs/5ab7431b5751451c3cc43443'
    }
  ];

  test('Blog related actions are prohibited', async () => {
    const results = await page.execute(actions);

    for (let result of results) {
      // console.log(result);
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });
});
