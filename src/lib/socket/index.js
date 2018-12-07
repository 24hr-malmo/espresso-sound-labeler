const socketIo = require('socket.io');

const gatherer = require('../gatherer');
const labeler = require('../labeler');

let io;

const init = (server) => {

    io = socketIo(server);

    const sendStatus = () => {
        io.emit('states.update', {
            gatherer: {
                state: gatherer.getState(),
                count: gatherer.getCount(),
            },
            labeler: {
                state: labeler.getState(),
            }
        });
    }

    io.on('connection', client => {

        sendStatus();

        client.on('toggle', () => {

            let currentGatherer = gatherer.getState();
            let currentLabeler = labeler.getState();

            gatherer.setState(!currentGatherer);
            labeler.setState(!currentLabeler);

            sendStatus();

        });

        client.on('event', data => { /* … */ });
        client.on('disconnect', () => { /* … */ });

    });
};

const emit = (event, payload) => {
    if (io) {
        io.emit(event, payload);
    }
}

exports.init = init;
exports.emit = emit;
