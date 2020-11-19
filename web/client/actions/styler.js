/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const STYLE_SAVED = 'STYLER_STYLE_SAVED';
export const SET_STYLER_LAYER = 'SET_STYLER_LAYER';
export const STYLE_SAVE_ERROR = 'STYLE_SAVE_ERROR';
export const STYLER_RESET = 'STYLER_RESET';

import Layers from '../api/geoserver/Layers';
import { saveStyle } from '../api/geoserver/Styles';

export  function setStylerLayer(layer) {
    return {
        type: SET_STYLER_LAYER,
        layer
    };
}
export  function styleSaved(name, style) {
    return {
        type: STYLE_SAVED,
        name,
        style
    };
}
export  function styleSaveError(layer, style, error) {
    return {
        type: STYLE_SAVE_ERROR,
        layer,
        style,
        error
    };
}
export  function reset(layer) {
    return {
        type: STYLER_RESET,
        layer
    };
}
export  function saveLayerDefaultStyle(geoserverBaseUrl, layerName, style) {
    return (dispatch) => {
        return Layers.getLayer(geoserverBaseUrl, layerName).then((layer) => {
            saveStyle(geoserverBaseUrl, layer.defaultStyle && layer.defaultStyle.name, style).then(()=> {
                dispatch(styleSaved(layer.defaultStyle.name, style));
            }).catch((e) => {styleSaveError(layerName, layer.defaultStyle, e); });

        }).catch((e) => {styleSaveError(layerName, null, e); });

    };
}
