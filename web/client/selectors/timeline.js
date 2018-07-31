const { get } = require('lodash');
module.exports = {
    rangeSelector: state => get(state, 'timeline.range')
};
