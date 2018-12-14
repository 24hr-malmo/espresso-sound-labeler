const fs = require('fs');
const mic = require('mic');
const PImage = require('pureimage');
const wavSpectro = require('wav-spectrogram');
const header = require("waveheader");
const zeroFill = require('zero-fill');
const mkdirp = require('mkdirp');
const moment = require('moment');
const os = require('os');
const readline = require('readline');
const socket = require('../socket');

let Gpio;

if (os.type() !== 'Darwin') {
    Gpio = require('pigpio').Gpio;
} else {
    readline.emitKeypressEvents(process.stdin);
    let keyMap = {
        17: 'q',
        27: 'w',
    };
    process.stdin.on('keypress', (str, key) => {
        if (key.name === 'q' || key.name === 'w') {
            Gpio.listeners.forEach(item => {
                if (keyMap[item.pin] === key.name) {
                    item.callback(0);
                }
            });
        }
    });
    Gpio = function (pin, options) {
        Gpio.listeners = Gpio.listeners || [];
        this.on = (name, callback) => {
            Gpio.listeners.push({pin, name, callback});
        };
        this.digitalWrite = () => {};
        this.glitchFilter = () => {};
    };
}

const readButton = (pin, label) => {
    const button = new Gpio(pin, { mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP, alert: true });
    button.glitchFilter(10000);
    button.on('alert', (level) => {
        if (level === 0) {
            record(label);
        }
    });
}

const led = new Gpio(4, { mode: Gpio.OUTPUT });

readButton(17, 'espresso');
readButton(27, 'nespresso');

let recording = false;
let recordTimeout = 0;

let counter = 0;

let time = 6000;
let delta = 1000;
let part = 1/8 * 1000;
let sampleLength = 4000;
let maxLength = delta / part * sampleLength;
let first = true;
let label = 'none';
let timeout = -1;
let maxTime = 30 * 60 * 1000;
let on = false;

let micInstance;

function record (label) {

    clearTimeout(timeout);

    if (!on) {
        return
    };

    if (!recording) {
        console.log('record', label);
        led.digitalWrite(1);
        recording = true;
        micInstance = start(label);
        timeout = setTimeout(() => {
            console.log('auto stop');
            led.digitalWrite(0);
            recording = false;
            micInstance.stop();
            micInstance = null;
        }, maxTime);
    } else {
        led.digitalWrite(0);
        console.log('stop');
        recording = false;
        micInstance.stop();
        micInstance = null;
    }
};

function start (label) {

    let buffer = Buffer.from([]);

    const micInstance = mic({ rate: '16000', channels: '1', });
    const micInputStream = micInstance.getAudioStream();

    const now = moment();
    const folder = `/data/${label}/${now.format('YYYY')}/${now.format('MM')}/${now.format('DD')}`;
    const filename = `${folder}/${now.format('HH_MM_ss')}-sound-${label}.wav`;

    mkdirp.sync(folder);
    const outputFileStream = fs.WriteStream(filename);

    micInputStream.pipe(outputFileStream);

    micInputStream.on('stopComplete', function() {
        console.log(`Save wav ${filename} with ${buffer.length} bytes`);
        counter++;
        socket.emit('gatherer.counter.update', {counter});
    });

    micInputStream.on('data', function(data) {
        buffer = Buffer.concat([buffer, data]);
    });

    micInstance.start();

    return micInstance;

};

/*
http.createServer(function (req, res) {
    res.write(`Sound labeler on. Recorded ${counter} sounds`);
    res.end();
}).listen(process.env.PORT || 80, function(){
    console.log("server start at port 80");
});

*/

exports.setState = (state) => {
    on = state;
}

exports.getState = () => {
    return on;
}


exports.getCount = () => {
    return counter;
};
