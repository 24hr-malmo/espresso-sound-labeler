const gatherer = require('../gatherer');
const labeler = require('../labeler');

const control = (state) => {

    if (state === 'gather') {
        gatherer.setState(true);          
        labeler.setState(false);          
    } else if (state === 'gather') {
        gatherer.setState(false);          
        labeler.setState(true);          
    } else {
        gatherer.setState(false);          
        labeler.setState(false);          
    }

};

module.export = control;
