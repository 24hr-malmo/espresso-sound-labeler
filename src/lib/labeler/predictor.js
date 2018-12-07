const path = require('path');
const fs = require('path');
const Jimp = require('jimp');
const tf = require('@tensorflow/tfjs'); 
const recursive = require("recursive-readdir"); 
const { PerformanceObserver, performance } = require('perf_hooks');

require('@tensorflow/tfjs-node');

const IMAGE_H = 255;
const IMAGE_W = 19;
const IMAGE_SIZE = IMAGE_H * IMAGE_W;

let model;
const labels = {
    0: 'Nothing',
    1: 'Espresso',
    2: 'Nespresso',
};

const modelFile = 'espresso-model-1.json';

const getModel = async () => {
    if (!model) {
        model = await tf.loadModel('file://' + path.join(__dirname, '../../model/' + modelFile));
    }
    return model;
}

const predict = async (tensor) => {
    const model = await getModel();
    const output = model.predict(tensor);
    const prediction = await output.as1D().argMax().data(); // .dataSync();
    return prediction[0];
};

const getFiles = (folder) => new Promise((resolve, reject) => {
    recursive(folder, function (err, files) {
        if (err) {
            return reject(err);
        }
        return resolve(files);
    });
});


const getFileLabel = (file) => {
    if (file.includes('nothing')) {
        return 0;
    } else if (file.includes('nespresso')) {
        return 2;
    } else if (file.includes('espresso')) {
        return 1;
    }
    return 0;
};

const publicPredictor = async (buffer) => {
    await getModel();
    const datasetBytesBuffer = new ArrayBuffer(buffer.length);
    const datasetBytesView = new Float32Array( datasetBytesBuffer);
    const tensor = tf.tensor(datasetBytesView, [1, 255, 19, 1]);
    const label = await predict(tensor);
    const humanReadableLabel = labels[label];
    return {
        label,
        humanReadableLabel,
    };
}

const test = async () => {

    try {

        await getModel();

        let predictedCorrect = 0;

        let allFiles = await getFiles(path.join(__dirname, '../data'));
        let files = allFiles.filter(file => file.includes('.png'));

        for ( let j = 0, jj = files.length; j < jj; j++ ) { 

            let file = files[j];
            let filename = path.basename(file);
            let realLabel = getFileLabel(filename);

            performance.mark('A');
            const image = await Jimp.read(file); // path.join(__dirname, '../data/-2.png'));

            const datasetBytesBuffer = new ArrayBuffer(IMAGE_SIZE * 4);
            const datasetBytesView = new Float32Array( datasetBytesBuffer);
            for ( let i = 0, ii = image.bitmap.data.length / 4; i < ii; i++ ) { 
                datasetBytesView[i] = image.bitmap.data[i * 4] / 255;
            }
            const tensor = tf.tensor(datasetBytesView, [1, 255, 19, 1]);
            const label = await predict(tensor);
            const humanReadableLabel = labels[label];
            performance.mark('B');

            predictedCorrect += label === realLabel ? 1 : 0;

            // performance.measure('A to B', 'A', 'B');
            console.log('Result %s for %s === %s (%s)', realLabel === label, realLabel, label, filename);


        }

        console.log('');
        console.log('Total: %s%', (predictedCorrect / files.length * 100).toFixed(2));
        console.log('');

    } catch (err) {

        console.log(err);

    }

};


const obs = new PerformanceObserver((items) => {
    console.log(items.getEntries()[0].duration);
    performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });

module.exports = publicPredictor;
