const path = require('path');
const Koa = require('koa');
const static = require('koa-static');
const bodyParser = require('koa-bodyparser');
const app = new Koa();

// All our services are behind a proxy, so we set this to make sure that secure cookies can be used
app.proxy = true;

app.use(bodyParser());

// Start everything
exports.start = () => new Promise((resolve, reject) => {

    try {

        let router = require('./routes');
        app.use(router.routes());
        app.use(router.allowedMethods());

        app.listen(parseInt(process.env.PORT, 10), function(err) {
            console.log('Server started at port', process.env.PORT);
            if (err) {
                return reject(err);
            }
            return resolve();
        });

    } catch (err) {
        console.log(err);
        return reject(err);
    }


});

exports.stop = function() {
    app.close();
};


process.on('SIGTERM', function () {
    logger.info('SIGTERM');
    process.exit(0);
});
