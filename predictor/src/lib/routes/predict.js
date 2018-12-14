const predict = require('../predict');
const zeroFill = require('zero-fill');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const SAMPLES_PATH = path.join(__dirname, '../../data/samples-4');
mkdirp.sync(SAMPLES_PATH);

let counter = 0;

module.exports = async (ctx, next) => {

    let spectogramBase64 = ctx.request.body.spectogram;

    if (process.env.SAVE_SAMPLES === 'true') {
        fs.writeFile(path.join(SAMPLES_PATH, `sample-${zeroFill(4, counter)}.txt`), spectogramBase64, 'utf8', (err) => {
            if (err) {
                console.log(err); 
            }
        });
        let wav = Buffer.from(ctx.request.body.wav, 'base64');
        fs.writeFile(path.join(SAMPLES_PATH, `sample-wav-${zeroFill(4, counter)}.wav`), wav, 'utf8', (err) => {
            if (err) {
                console.log(err); 
            }
        });
        counter++;
    }

    let spectogram = Buffer.from(spectogramBase64, 'base64');

    let prediction = await predict(spectogram);

    console.log(prediction);

    ctx.body = {
        date: (new Date()).getTime(),
        success: true,
        ...prediction,
    };

    await next();

};
