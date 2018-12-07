const fs = require('fs');
const mic = require('mic');
const PImage = require('pureimage');
const wavSpectro = require('wav-spectrogram');
const header = require("waveheader");
const zeroFill = require('zero-fill');
const bufferToSpectogram = require('buffer-to-spectogram');
const predictor = require('./predictor');
const socket = require('../socket');

let on = false;
let micInstance;

let counter = 0;
let time = 6000;
let delta = 1000;
let part = 1/8 * 1000;
let sampleLength = 4000;
let maxLength = delta / part * sampleLength;

console.log(maxLength);

const start = () => {

    if (!on) {
        return;
    }

    micInstance = mic({
        rate: '16000',
        channels: '1',
    });

    let buffer = Buffer.from([]);
    let first = true;
    let label = 'none';

    const micInputStream = micInstance.getAudioStream();

    micInputStream.on('data', async function(data) {

        if (!first) {

            buffer = Buffer.concat([buffer, data]);

            if (buffer.length >= maxLength) {

                const deltaBuffer = buffer.slice(0, maxLength);

                buffer = buffer.slice(maxLength);

                // console.log('eee', deltaBuffer.length);

                let h = header(deltaBuffer.length, { sampleRate: 16000, channels: 1 });

                const wavBuffer = Buffer.concat([h, deltaBuffer]);

                const height = 255;
                let flatImage = PImage.make(1, height);

                const imageData = await bufferToSpectogram(wavBuffer, '/Users/camilo/Projects/espresso-sound-labeler/temp.png', {returnAsBuffer: true, isWav: true});
                // console.log('test',  imageData[0].length, imageData[0].length / 4);

                const prediction = await predictor(imageData[0]);
                prediction.date = (new Date()).getTime();
                socket.emit('prediction.update', prediction);
                // console.log(prediction.humanReadableLabel);

                // for ( let mainY = 0, mainYMax = pngFiles.length; mainY < mainYMax; mainY++ ) { 
                //                for ( let mainX = 0, mainXMax = flatImage.width; mainX < mainXMax; mainX++ ) { 
                //
                //                    
                //
                //                                    let idx = flatImage.datagetPixelIndex(mainX, 0); 
                //
                //                                    let x1 = mainX % width;
                //                                    let y1 = Math.floor(mainX / width);
                //
                //                                    // console.log(mainY, image.bitmap.data);//image.bitmap.data);
                //                                    let imagePosition = imageData.getPixelIndex(x1, y1); 
                //
                //                                    //console.log(x1, y1, imagePosition, imagePosition2);
                //                                    flatImage.bitmap.data[idx + 0] = image.bitmap.data[imagePosition + 0];
                //                                    flatImage.bitmap.data[idx + 1] = image.bitmap.data[imagePosition + 1];
                //                                    flatImage.bitmap.data[idx + 2] = image.bitmap.data[imagePosition + 2];
                //                                    flatImage.bitmap.data[idx + 3] = image.bitmap.data[imagePosition + 3];
                //
                //                                }
                //
                //
                //

                // console.log(imageData);

                // buffer = Buffer.from([]);
                counter++;

            }

        }

        first = false;

    });

    micInstance.start();

};

exports.setState = (state) => {
    on = state;
    if (state) {
        console.log('Start labeling');
        start();
    } else {
        if (micInstance) {
            console.log('Stop labeling');
            micInstance.stop();
            micInstance = null;
        }
    }
}

exports.getState = () => {
    return on;
}


