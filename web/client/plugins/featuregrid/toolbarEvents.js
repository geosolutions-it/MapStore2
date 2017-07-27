const {toggleControl} = require('../../actions/controls');
const {toggleTool,
    toggleEditMode,
    toggleViewMode,
    closeFeatureGrid,
    saveChanges,
    createNewFeatures,
    startEditingFeature,
    startDrawingFeature,
    deleteGeometry
} = require('../../actions/featuregrid');

module.exports = {
    createFeature: () => createNewFeatures([{}]),
    saveChanges: () => saveChanges(),
    clearFeatureEditing: () => toggleTool("clearConfirm", true),
    deleteGeometry: () => deleteGeometry(),
    deleteFeatures: () => toggleTool("deleteConfirm", true),
    download: () => toggleControl("wfsdownload"),
    settings: () => toggleTool("settings"),
    switchEditMode: () => toggleEditMode(),
    startEditingFeature: () => startEditingFeature(),
    startDrawingFeature: () => startDrawingFeature(),
    switchViewMode: () => toggleViewMode(),
    onClose: () => closeFeatureGrid()
};
