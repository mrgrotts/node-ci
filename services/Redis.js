const { Query } = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const redisClient = redis.createClient(keys.redisUrl);
redisClient.hget = util.promisify(redisClient.hget);

let clientKey;

class Redis extends Query {
  constructor(clientKey = hashKey, client = redisClient) {
    super();
    this.hashKey = hashKey;
    this.useCache = true;
    this.options = {};
    this.client = client;
  }

  cache(options) {
    this.useCache = true;
    this.hashKey = JSON.stringify(this.options.key || '');

    return this;
  }

  async clearHash(hashKey) {
    await this.client.del(JSON.stringify(this.hashKey));
  }
}

module.exports = Redis;
