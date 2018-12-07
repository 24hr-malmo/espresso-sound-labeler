const router = require('koa-router')();

router.get('/', require('./control'));

module.exports = router;
