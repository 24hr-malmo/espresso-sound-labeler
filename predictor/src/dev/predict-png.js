const PImage = require('pureimage');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp')
const bufferToSpectogram = require('buffer-to-spectogram');

const predict = require('../lib/predict');

let images = path.join(__dirname, './'); // sample-001y.png');

predict.test(images);
