const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisURL);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this.cached = true;
  this.hashKey = JSON.stringify(options.key || '');

  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.cached) {
    return exec.apply(this, arguments);
  }

  // copy and stringify Query object and add mongo collection key:value
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // see if we have a value for 'key' in redis
  const cached = await client.hget(this.hashKey, key);

  // if we do, return that
  if (cached) {
    const data = JSON.parse(cached);

    // return array or object depending on data
    return Array.isArray(data) ? data.map(d => new this.model(d)) : new this.model(data);
  }

  // otherwise, issue the query and store the result in redis
  const query = await exec.apply(this, arguments);

  // future sets will have an expiration
  client.hset(this.hashKey, key, JSON.stringify(query), 'EX', 10);

  return query;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
