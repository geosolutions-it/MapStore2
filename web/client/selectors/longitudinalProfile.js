/*
* Copyright 2023, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import {get, head} from "lodash";

import {
    CONTROL_DOCK_NAME,
    CONTROL_NAME,
    CONTROL_PROPERTIES_NAME,
    LONGITUDINAL_VECTOR_LAYER_ID,
    LONGITUDINAL_VECTOR_LAYER_ID_POINT,
    DEFAULT_NODATA_THRESHOLD
} from '../plugins/longitudinalProfile/constants';
import {additionalLayersSelector} from '../selectors/additionallayers';
import {getSelectedLayer} from "../selectors/layers";
import {mapSelector} from "../selectors/map";

/**
 * selects longitudinalProfile state
 * @name longitudinalProfile
 * @memberof selectors
 * @static
 */
export const isActiveSelector = (state) => state?.controls[CONTROL_NAME]?.enabled;
export const isParametersOpenSelector = (state) => state?.controls[CONTROL_PROPERTIES_NAME]?.enabled;
export const isDockOpenSelector = (state) => state?.controls[CONTROL_DOCK_NAME]?.enabled;

export const isInitializedSelector = (state) => state?.longitudinalProfile?.initialized;
export const isLoadingSelector = (state) => state?.longitudinalProfile?.loading;
export const dataSourceModeSelector = (state) => state?.longitudinalProfile?.mode;
export const crsSelectedDXFSelector = (state) => state?.longitudinalProfile?.crsSelectedDXF || "EPSG:3857";
export const geometrySelector = (state) => state?.longitudinalProfile?.geometry;
export const isActiveMenuSelector = (state) => isParametersOpenSelector(state) || (dataSourceModeSelector(state) && dataSourceModeSelector(state) !== "idle");
export const infosSelector = (state) => state?.longitudinalProfile?.infos;
export const pointsSelector = (state) => state?.longitudinalProfile?.points;
export const projectionSelector = (state) => state?.longitudinalProfile?.projection;
export const configSelector = (state) => state?.longitudinalProfile?.config;
export const noDataThresholdSelector = (state) => configSelector(state)?.noDataThreshold || DEFAULT_NODATA_THRESHOLD;
export const referentialSelector = (state) => configSelector(state)?.referential;
export const chartTitleSelector = (state) => configSelector(state)?.chartTitle;
export const distanceSelector = (state) => configSelector(state)?.distance;

export const isSupportedLayerSelector = (state) => {
    const selectedLayer = getSelectedLayer(state);
    const layerType = selectedLayer?.type;
    return ['wms', 'wfs', 'vector'].includes(layerType)
        && (layerType === 'wms' ? selectedLayer?.search?.type === 'wfs' : true)
        && selectedLayer.visibility;
};

export const isListeningClickSelector = (state) => !!(get(mapSelector(state), 'eventListeners.click', []).find((el) => el === CONTROL_NAME));

export const isMaximizedSelector = (state) => state?.longitudinalProfile?.maximized;

export const vectorLayerFeaturesSelector = (state) => head(additionalLayersSelector(state).filter(l => (l.id === LONGITUDINAL_VECTOR_LAYER_ID || l.id === LONGITUDINAL_VECTOR_LAYER_ID_POINT)))?.options?.features;
