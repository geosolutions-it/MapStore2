import { toggleControl } from '../../actions/controls';

import {
    toggleTool,
    toggleEditMode,
    toggleViewMode,
    closeFeatureGridConfirm,
    saveChanges,
    hideSyncPopover,
    setTimeSync,
    toggleShowAgain,
    createNewFeatures,
    startEditingFeature,
    startDrawingFeature,
    deleteGeometry,
    openAdvancedSearch,
    zoomAll
} from '../../actions/featuregrid';

import { createChart } from '../../actions/widgets';
import { toggleSyncWms } from '../../actions/wfsquery';

export default {
    createFeature: () => createNewFeatures([{}]),
    saveChanges: () => saveChanges(),
    clearFeatureEditing: () => toggleTool("clearConfirm", true),
    deleteGeometry: () => deleteGeometry(),
    deleteFeatures: () => toggleTool("deleteConfirm", true),
    download: () => toggleControl("layerdownload"),
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
    hideSyncPopover: () => hideSyncPopover(),
    toggleShowAgain: () => toggleShowAgain(),
    chart: () => createChart()
};
