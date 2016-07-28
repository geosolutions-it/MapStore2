const {createSelector} = require('reselect');


const ruleselctor = (state) => state.vectorstyler && state.vectorstyler.rule && state.vectorstyler.rules.find((r) => {return r.id === state.vectorstyler.rule; });

const symbolselector = createSelector([ruleselctor],
     (rule) => ({
    shapeStyle: rule && rule.symbol || {}
}));

module.exports = {
    ruleselctor,
    symbolselector
};
