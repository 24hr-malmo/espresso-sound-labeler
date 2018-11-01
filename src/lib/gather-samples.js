const fs = require('fs');
const mic = require('mic');
const PImage = require('pureimage');
const wavSpectro = require('wav-spectrogram');
const header = require("waveheader");
const zeroFill = require('zero-fill');
const Gpio = require('pigpio').Gpio;

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

// readButton(, 'test');
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
let buffer = Buffer.from([]);
let first = true;
let label = 'none';


const micInstance = mic({
    rate: '16000',
    channels: '1',
});


function record (label) {
    if (!recording) {
        console.log('record', label);
        led.digitalWrite(1);
        recording = true;
        //streamAudio();
        //micInstance.start();
    } else {
        led.digitalWrite(0);
        console.log('stop');
        recording = false;
        //micInstance.stop();
    }
};

function streamAudio () {

    const micInputStream = micInstance.getAudioStream();

    micInputStream.on('data', function(data) {

        if (!first) {

            buffer = Buffer.concat([buffer, data]);


            if (buffer.length >= maxLength) {

                let h = header(buffer.length, { sampleRate: 16000, channels: 1 });

                const wavBuffer = Buffer.concat([h, buffer]);

                let filename = `/data/sound-${zeroFill(4, counter)}.wav`;

                fs.writeFile(filename, wavBuffer, 'binary', (err) => {
                    console.log(`Save wav ${filename} with ${wavBuffer.length} bytes`);
                    if (err) {
                        console.log('error', err);
                    }
                });

                buffer = Buffer.from([]);
                counter++;

            }

        }

        first = false;

    });

};


console.log('Started');
