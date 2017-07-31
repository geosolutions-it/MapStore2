const {get} = require('lodash');


module.exports = {
    selectedFeatures: (state) => get(state, state && state.highlight && state.highlight.featuresPath || "highlight.emptyFeatures")

};
