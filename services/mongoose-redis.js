const mongoose = require('mongoose');
const Redis = require('./Redis');

const redis = new Redis();
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  redis.useCache = true;
  redis.hashKey = JSON.stringify(options.key || '');

  this.redis = redis;

  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!redis.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // See if we have a value for 'key' in redis
  const cacheValue = await redis.client.hget(redis.hashKey, key);

  // If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc) ? doc.map(d => new redis.model(d)) : new redis.model(doc);
  }

  // Otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments);

  redis.client.hset(redis.hashKey, key, JSON.stringify(result), 'EX', 10);

  return result;
};

async function clearHash(hashkey) {
  await redis.clearHash(hashKey);
  redis.client.del(JSON.stringify(hashKey));
}

module.exports = clearHash;
