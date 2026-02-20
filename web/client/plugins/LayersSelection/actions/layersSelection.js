export const SELECT_CLEAN_SELECTION = "SELECT:CLEAN_SELECTION";
export const SELECT_STORE_CFG = "SELECT:STORE_CFG";
export const ADD_OR_UPDATE_SELECTION = "SELECT:ADD_OR_UPDATE_SELECTION";
export const UPDATE_SELECTION_FEATURE = "SELECT:UPDATE_SELECTION_FEATURE";
/**
 * Action creator to clean the current selection based on geometry type.
 *
 * @param {string} geomType - The type of geometry to clean (e.g., "Point", "Polygon").
 * @returns {{ type: string, geomType: string }} The action object.
 */
export function cleanSelection(geomType) {
    return {
        type: SELECT_CLEAN_SELECTION,
        geomType
    };
}

/**
 * Action creator to store configuration settings related to selection.
 *
 * @param {Object} cfg - Configuration object to store.
 * @returns {{ type: string, cfg: Object }} The action object.
 */
export function storeConfiguration(cfg) {
    return {
        type: SELECT_STORE_CFG,
        cfg
    };
}

/**
 * Action creator to add or update a layer selection with GeoJSON data.
 *
 * @param {string} layer - The name or ID of the layer.
 * @param {Object} geoJsonData - The GeoJSON data representing the selection.
 * @returns {{ type: string, layer: string, geoJsonData: Object }} The action object.
 */
export function addOrUpdateSelection(layer, geoJsonData) {
    return {
        type: ADD_OR_UPDATE_SELECTION,
        layer,
        geoJsonData
    };
}

export function updateSelectionFeature(feature) {
    return {
        type: UPDATE_SELECTION_FEATURE,
        feature
    };
}
