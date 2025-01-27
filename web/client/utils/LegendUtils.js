/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEmpty } from "lodash";
import { getExtentFromViewport } from "./CoordinatesUtils";
import { ServerTypes } from "./LayersUtils";
import { optionsToVendorParams } from "./VendorParamsUtils";
import { composeFilterObject } from "../components/widgets/enhancers/utils";
import { toCQLFilter } from "./FilterUtils";
import { arrayUpdate } from "./ImmutableUtils";

export const INTERACTIVE_LEGEND_ID = "interactiveLegend";
export const LEGEND_FORMAT = {
    IMAGE: "image/png",
    JSON: "application/json"
};

export const getLayerFilterByLegendFormat = (layer, format = LEGEND_FORMAT.JSON) => {
    const layerFilter = layer?.layerFilter;
    if (layer && layer.type === "wms" && layer.url) {
        if (format === LEGEND_FORMAT.JSON && !isEmpty(layerFilter)) {
            return {
                ...layerFilter,
                filters: (layerFilter?.filters ?? [])?.filter(f => f.id !== INTERACTIVE_LEGEND_ID)
            };
        }
        return layerFilter;
    }
    return layerFilter;
};

export const getWMSLegendConfig = ({
    format,
    legendHeight,
    legendWidth,
    layer,
    mapSize,
    projection,
    mapBbox,
    legendOptions
}) => {
    const baseParams = {
        service: "WMS",
        request: "GetLegendGraphic",
        format,
        height: legendHeight,
        width: legendWidth,
        layer: layer.name,
        style: layer.style || null,
        version: layer.version || "1.3.0",
        SLD_VERSION: "1.1.0",
        LEGEND_OPTIONS: legendOptions
    };

    if (layer.serverType !== ServerTypes.NO_VENDOR) {
        return {
            ...baseParams,
            // hideEmptyRules is applied for all layers except background layers
            LEGEND_OPTIONS: `hideEmptyRules:${layer.group !== "background"};${legendOptions}`,
            SRCWIDTH: mapSize?.width ?? 512,
            SRCHEIGHT: mapSize?.height ?? 512,
            SRS: projection,
            CRS: projection,
            ...(mapBbox?.bounds && {BBOX: getExtentFromViewport(mapBbox, projection)?.join(',')}),
            ...optionsToVendorParams({ ...layer, layerFilter: getLayerFilterByLegendFormat(layer, format) })
        };
    }

    return {
        ...baseParams,
        ...layer.params
    };
};

/**
 * Updates the layers with the filters from dependencies
 * to perform legend filtering in the legend widget
 */
export const updateLayerWithLegendFilters = (layers, dependencies) => {
    const targetLayerName = dependencies?.layer?.name;
    const filterObj = dependencies?.filter || {};
    const layerInCommon = layers?.find(l => l.name === targetLayerName) || {};
    let filterObjCollection = {};
    let layersUpdatedWithCql = {};
    let cqlFilter = undefined;

    if (dependencies?.mapSync && !isEmpty(layerInCommon)
        && (filterObj.featureTypeName ? filterObj.featureTypeName === targetLayerName : true)) {
        if (dependencies?.quickFilters) {
            filterObjCollection = {
                ...filterObjCollection,
                ...composeFilterObject(filterObj, dependencies?.quickFilters, dependencies?.options)
            };
        }
        cqlFilter = toCQLFilter(filterObjCollection);
        if (!isEmpty(filterObjCollection) && cqlFilter) {
            layersUpdatedWithCql = arrayUpdate(false,
                {
                    ...layerInCommon,
                    params: optionsToVendorParams({ params: {CQL_FILTER: cqlFilter}})
                },
                {name: targetLayerName},
                layers
            );
        }
    } else {
        layersUpdatedWithCql = layers.map(l => ({...l, params: {...l.params, CQL_FILTER: undefined}}));
    }
    return layersUpdatedWithCql;
};

export default {
    getLayerFilterByLegendFormat,
    getWMSLegendConfig,
    updateLayerWithLegendFilters
};

