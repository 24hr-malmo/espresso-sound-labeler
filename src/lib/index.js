const server = require('./server');
const controller = require('./controller');
const gatherer = require('./gatherer');
const labeler = require('./labeler');

gatherer.setState(true);
labeler.setState(false);

server.start();
