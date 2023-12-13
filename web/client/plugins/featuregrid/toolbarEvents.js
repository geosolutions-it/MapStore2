import {
    toggleTool,
    toggleEditMode,
    toggleViewMode,
    closeFeatureGridConfirm,
    saveChanges,
    setTimeSync,
    toggleShowAgain,
    createNewFeatures,
    startEditingFeature,
    startDrawingFeature,
    deleteGeometry,
    openAdvancedSearch,
    zoomAll,
    setViewportFilter
} from '../../actions/featuregrid';

import { toggleSyncWms } from '../../actions/wfsquery';
import {
    setSnappingLayer, toggleSnapping,
    setSnappingConfig
} from "../../actions/draw";

export default {
    createFeature: () => createNewFeatures([{}]),
    saveChanges: () => saveChanges(),
    clearFeatureEditing: () => toggleTool("clearConfirm", true),
    deleteGeometry: () => deleteGeometry(),
    deleteFeatures: () => toggleTool("deleteConfirm", true),
    settings: () => toggleTool("settings"),
    switchEditMode: () => toggleEditMode(),
    startEditingFeature: () => startEditingFeature(),
    startDrawingFeature: () => startDrawingFeature(),
    switchViewMode: () => toggleViewMode(),
    onClose: () => closeFeatureGridConfirm(),
    showQueryPanel: () => openAdvancedSearch(),
    zoomAll: () => zoomAll(),
    sync: () => toggleSyncWms(),
    setTimeSync,
    toggleShowAgain: () => toggleShowAgain(),
    toggleSnapping: () => toggleSnapping(),
    setViewportFilter: (value) => setViewportFilter(value),
    setSnappingLayer: (layerId) => setSnappingLayer(layerId),
    setSnappingConfig: (value, prop, pluginCfg) => setSnappingConfig(value, prop, pluginCfg)
};
