const PImage = require('pureimage');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp')
const bufferToSpectogram = require('buffer-to-spectogram');

const createImage = (buffer, filename) => new Promise(async (resolve, reject) => {

    const imageData = await bufferToSpectogram(buffer, filename, {returnAsBuffer: true, isWav: true});
    const spectogram = imageData[0];

    let jimg = new Jimp(19 * 255, 1);

    let c = 0;

    for (var i = 0; i < spectogram.length; i++) {
        jimg.bitmap.data[i] = spectogram[i];
        c++;
    }

    console.log('Done', c / 4, 19 * 255);
    jimg.write(filename);

});

let fileName = path.join(__dirname, '../data/samples-3/sample-wav-0011.wav');
let output = path.join(__dirname, './sample-001y.png');
let wav = fs.readFile(fileName, async (err, content) => {

    if (err) {
        console.log(err);
        return;
    }

    try {
        await createImage(content, output);
    } catch (err) {
        console.log(err);
    }

});



