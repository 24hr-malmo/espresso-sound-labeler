const router = require('koa-router')();

router.post('/predict', require('./predict'));

module.exports = router;
