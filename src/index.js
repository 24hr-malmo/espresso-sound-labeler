if (process.env.GATHER_SAMPLES === 'true') {
    module.exports = require('./lib/gather-samples');
} else {
    module.exports = require('./lib');
}
