const {toggleControl} = require('../../actions/controls');
const {toggleTool,
    toggleEditMode,
    toggleViewMode,
    closeFeatureGridConfirm,
    saveChanges,
    createNewFeatures,
    startEditingFeature,
    startDrawingFeature,
    deleteGeometry,
    openAdvancedSearch,
    zoomAll
} = require('../../actions/featuregrid');
const {toggleSyncWms} = require('../../actions/wfsquery');

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
    onClose: () => closeFeatureGridConfirm(),
    showQueryPanel: () => openAdvancedSearch(),
    zoomAll: () => zoomAll(),
    sync: () => toggleSyncWms()
};
