const PImage = require('pureimage');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp')
const bufferToSpectogram = require('buffer-to-spectogram');
const recursive = require("recursive-readdir");


const predict = require('../lib/predict');

const wavsFolder = path.join(__dirname, '../data/samples-4'); // sample-001y.png');

const read = (file) => new Promise((resolve, reject) => {
    fs.readFile(file, (err, content) => {
        if (err) {
            return reject(err);
        }
        return resolve(content);
    });
});

recursive(wavsFolder, async (err, files) => {

    const wavFiles = files.filter(file => file.match(/\.wav/));

    if (wavFiles.length > 0) {


        for ( let i = 0, ii = wavFiles.length; i < ii; i++ ) { 

            let file = wavFiles[i];

            let wavBuffer = await read(file);
            const imageData = await bufferToSpectogram(wavBuffer, '/Users/camilo/Projects/espresso-sound-labeler/temp.png', {returnAsBuffer: true, isWav: true});
            const spectogram = imageData[0];
            let result = await predict(spectogram);

            console.log(result.humanReadableLabel);

        }

    }

});

