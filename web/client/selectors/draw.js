const changedGeometriesSelector = state => state && state.draw && state.draw.tempFeatures;

module.exports = {
    changedGeometriesSelector
};
