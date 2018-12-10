const predict = require('../predict');

module.exports = async (ctx, next) => {

    let spectogramBase64 = ctx.request.body.spectogram;
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
