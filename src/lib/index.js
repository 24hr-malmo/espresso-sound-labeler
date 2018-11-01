const fs = require('fs');
const mic = require('mic');
const PImage = require('pureimage');
const wavSpectro = require('wav-spectrogram');
const header = require("waveheader");
const zeroFill = require('zero-fill');

const micInstance = mic({
    rate: '16000',
    channels: '1',
});

let counter = 0;

let time = 6000;
let delta = 1000;
let part = 1/8 * 1000;
let sampleLength = 4000;
let maxLength = delta / part * sampleLength;
let buffer = Buffer.from([]);
let first = true;
let label = 'none';

const micInputStream = micInstance.getAudioStream();

micInputStream.on('data', function(data) {

    if (!first) {

        buffer = Buffer.concat([buffer, data]);


        if (buffer.length >= maxLength) {

            let spFilename = `/data/a-specto-${zeroFill(4, counter)}.png`;
            let img = PImage.make(128, 255);
            let ctx = img.getContext('2d');

            let h = header(buffer.length, { sampleRate: 16000, channels: 1 });

            const wavBuffer = Buffer.concat([h, buffer]);

            let filename = `/data/sound-${zeroFill(4, counter)}.wav`;

            fs.writeFile(filename, wavBuffer, 'binary', (err) => {

                console.log(`Save wav ${filename} with ${wavBuffer.length} bytes`);
                if (err) {
                    console.log('error', err);
                }

                wavSpectro.drawSpectrogram({arrayBuffer: wavBuffer, canvasElem: img, cmap: 'greys', frameLengthMs: .1, frameStepMs: .05}, function () {
                    PImage.encodePNGToStream(img, fs.createWriteStream(spFilename)).then(() => {
                        console.log(`Save ${spFilename} with ${wavBuffer.length} bytes`);
                    }).catch((e)=>{
                        console.log("there was an error writing");
                    });
                });

            });

            buffer = Buffer.from([]);
            counter++;

        }

    }

    first = false;

});

micInstance.start();

setTimeout(function() {
    micInstance.stop();
}, time);

