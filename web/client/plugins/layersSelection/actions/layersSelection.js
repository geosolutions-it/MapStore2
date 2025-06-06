export const SELECT_CLEAN_SELECTION = "SELECT:CLEAN_SELECTION";
export const SELECT_STORE_CFG = "SELECT:STORE_CFG";
export const ADD_OR_UPDATE_SELECTION = "SELECT:ADD_OR_UPDATE_SELECTION";

export function cleanSelection(geomType) {
    return {
        type: SELECT_CLEAN_SELECTION,
        geomType
    };
}

export function storeConfiguration(cfg) {
    return {
        type: SELECT_STORE_CFG,
        cfg
    };
}

export function addOrUpdateSelection(layer, geoJsonData) {
    return {
        type: ADD_OR_UPDATE_SELECTION,
        layer,
        geoJsonData
    };
}
