const PImage = require('pureimage');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp')

const createImage = (base64, filename) => new Promise((resolve, reject) => {

    let spectogram = Buffer.from(base64, 'base64');
    let size = 255 * 4;

    // Create a new blank image, same size as Robotjs' one
    let jimg = new Jimp(255, 1);

    for (var i = 0; i < size * 4; i += 4) {

        let x = Math.floor(i / 4);

        var hex = ''
            + spectogram[x + 0].toString(16)
            + spectogram[x + 1].toString(16)
            + spectogram[x + 2].toString(16)
            + spectogram[x + 3].toString(16);

        jimg.bitmap.data[x + 0] = spectogram[x + 0];
        jimg.bitmap.data[x + 1] = spectogram[x + 1];
        jimg.bitmap.data[x + 2] = spectogram[x + 2];
        jimg.bitmap.data[x + 3] = spectogram[x + 3];

    }

    jimg.write(filename);

    return resolve();

    let img = PImage.make(19, 255);
    let ctx = img.getContext('2d');
    ctx.putImageData(spectogram, 0, 0);

    PImage.encodePNGToStream(img, fs.createWriteStream(filename))
        .then(() => {
            resolve({ filename, });
        })
        .catch((err)=>{
            return reject(err);
        });

});

let fileName = path.join(__dirname, '../data/samples/sample-0020.txt');
let output = path.join(__dirname, '../data/sample-0020.png');
let base64Content = fs.readFile(fileName, 'utf8', async (err, content) => {
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



