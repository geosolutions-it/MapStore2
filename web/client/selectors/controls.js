const isFeatureEditorOpen = state => state && state.controls && state.controls.featuregrid && state.controls.featuregrid.open;

module.exports = {
    isFeatureEditorOpen
};
