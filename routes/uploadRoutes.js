const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');
const keys = require('../config/keys');

AWS.config.region = 'us-east-2';
const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;
    const params = {
      Bucket: 'advanced-node-jg',
      ContentType: 'image/jpeg',
      Key: key
    };

    const url = s3.getSignedUrl('putObject', params);
    res.json({ key, url });
  });
};
