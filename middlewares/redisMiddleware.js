const Redis = require('../services/Redis');

const redisMiddleware = async (req, res, next) => {
    const redis = await new Redis(req.user.id);

    return {
        cache: function() {
            await next();
    
            redis.cache(req.user.id);
        },
        exec: function() {
            await next();
    
            redis.exec();
        },
        clearHash: function() {
            await next();
    
            redis.clearHash(req.user.id);
        }
    }
};

module.exports = redisMiddleware;