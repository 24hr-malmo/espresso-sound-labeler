const fs = require('fs');
const mic = require('mic');
const PImage = require('pureimage');
const wavSpectro = require('wav-spectrogram');
const header = require("waveheader");
const zeroFill = require('zero-fill');
const mkdirp = require('mkdirp');
const moment = require('moment');
const Gpio = require('pigpio').Gpio;
const http = require('http');

const readButton = (pin, label) => {
    const button = new Gpio(pin, { mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP, alert: true });
    button.glitchFilter(10000);
    button.on('alert', (level) => {
        if (level === 0) {
            record(label);
        }
    });
}

const led = new Gpio(17, { mode: Gpio.OUTPUT });

readButton(27, 'espresso');
readButton(4, 'nespresso');

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





let micInstance;

function record (label) {
    if (!recording) {
        console.log('record', label);
        led.digitalWrite(1);
        recording = true;
        micInstance = start(label);
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
    });

    micInputStream.on('data', function(data) {
        buffer = Buffer.concat([buffer, data]);
    });

    micInstance.start();

    return micInstance;

};

http.createServer(function (req, res) {
    res.write(`Sound labeler on. Recorded ${counter} sounds`);
    res.end();
}).listen(process.env.PORT || 80, function(){
    console.log("server start at port 80");
});

console.log('Started');
