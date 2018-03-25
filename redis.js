const redis = require('redis');

const redisURL = `redis://127.0.0.1:6379`;

const client = redis.createClient(redisURL);
client.set('hi', 'there');

// client.get('hi', (error, response) => console.log(response));
client.get('hi', console.log);
// console.log(client);

client.hset('greeting', 'one', 'hey');

// client.get('hi', (error, response) => console.log(response));
client.hget('greeting', 'one', console.log);
// console.log(client);

client.set('bud', JSON.stringify({ hey: 'bud' }));
client.get('bud', console.log);

client.get('bud', (error, value) => console.log(JSON.parse(value)));

// this is the call in JS to clear Redis
client.flushall();
