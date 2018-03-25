**PM2 AND CLUSTERS**
pm2 start index.js `-i 0` --> start pm2 process manager and let it set number of workers
pm2 list --> all instances
pm2 show [FILENAME / APP NAME] --> look at general information about workers
pm2 monit --> detailed information about workers
pm2 delete [FILENAME / APP NAME]--> end processes

**REDIS**
# USE LINUX SUBSYSTEM TO INSTALL AND RUN REDIS
- Installed in grotts@JoeyGPC:/mnt/c/Users/josep/redis-4.0.8
$ wget http://download.redis.io/releases/redis-4.0.8.tar.gz
$ tar xzf redis-4.0.8.tar.gz
$ cd redis-4.0.8
$ make

# START REDIS
$ src/redis-server

# RESETTING REDIS
`client.flushall()` <-- FROM NODE COMMAND LINE!