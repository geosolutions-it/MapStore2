/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {compose, withHandlers, withProps} from 'recompose';

import { castArray, get, isEmpty, find } from 'lodash';
import deleteWidget from './deleteWidget';
import { editableWidget, defaultIcons, withHeaderTools } from './tools';
import { getScales } from '../../../utils/MapUtils';
import { WIDGETS_MAPS_REGEX } from "../../../actions/widgets";
import { getInactiveNode, DEFAULT_GROUP_ID } from '../../../utils/LayersUtils';
import { composeFilterObject } from './utils';
import { toCQLFilter } from '../../../utils/FilterUtils';
import { arrayUpdate } from '../../../utils/ImmutableUtils';
import { optionsToVendorParams } from '../../../utils/VendorParamsUtils';

/**
 * map dependencies to layers, scales and current zoom level to show legend items for current zoom.
 * Add also base tools and menu to the widget
 */
export default compose(
    withProps(({ dependencies = {}, dependenciesMap = {}, mapSync }) => {
        const allLayers = dependencies[dependenciesMap.layers] || dependencies.layers || [];
        const groups = castArray(dependencies[dependenciesMap.groups] || dependencies.groups || []);
        let layers = allLayers
            // filter backgrounds and inactive layer
            // the inactive layers are the one with a not visible parent group
            .filter((layer = {}) =>
                layer.group !== 'background' && !getInactiveNode(layer?.group || DEFAULT_GROUP_ID, groups)
            )
            .map(({ group, ...layer }) => layer);
        const targetLayerName = dependencies && dependencies.layer && dependencies.layer.name;
        const filterObj = dependencies.filter || {};
        const layerInCommon = find(layers, {name: targetLayerName}) || {};
        let filterObjCollection = {};
        let layersUpdatedWithCql = {};
        let cqlFilter = undefined;

        // update the layer filters to apply filtering to the legend
        if (mapSync && !isEmpty(layerInCommon) && (filterObj.featureTypeName ? filterObj.featureTypeName === targetLayerName : true)) {
            if (dependencies.quickFilters) {
                filterObjCollection = {...filterObjCollection, ...composeFilterObject(filterObj, dependencies.quickFilters, dependencies.options)};
            }
            cqlFilter = toCQLFilter(filterObjCollection);
            if (!isEmpty(filterObjCollection) && cqlFilter) {
                layersUpdatedWithCql = arrayUpdate(false,
                    {...layerInCommon, params: optionsToVendorParams({ params: {CQL_FILTER: cqlFilter}})},
                    {name: targetLayerName},
                    layers
                );
            }
        } else {
            layersUpdatedWithCql = layers.map(l => ({...l, params: {...l.params, CQL_FILTER: undefined}}));
        }
        layers = layersUpdatedWithCql;
        return {
            allLayers,
            map: {
                layers,
                // use empty so it creates the default group that will be hidden in the layers tree
                groups: [],
                projection: dependencies.projection,
                bbox: dependencies.viewport
            },
            dependencyMapPath: dependenciesMap.layers || '',
            scales: getScales(
                // TODO: this is a fallback that checks the viewport if projection is not defined. We should use only projection
                dependencies.projection || dependencies.viewport && dependencies.viewport.crs || 'EPSG:3857',
                get( dependencies, "mapOptions.view.DPI")
            ),
            currentZoomLvl: dependencies.zoom
        };
    }),
    withHandlers({
        updateProperty: ({ updateProperty, dependencyMapPath, allLayers = [] }) => (key, value) => {
            if (dependencyMapPath) {
                const [, widgetId, mapId] = WIDGETS_MAPS_REGEX.exec(dependencyMapPath) || [];
                if (mapId && key === 'map') {
                    const updatedLayers = value?.layers || [];
                    const newLayers = allLayers.map(layer => {
                        const updateLayer = updatedLayers.find(l => l.id === layer.id);
                        if (updateLayer) {
                            return {
                                ...layer,
                                visibility: updateLayer.visibility,
                                opacity: updateLayer.opacity,
                                expanded: updateLayer.expanded,
                                layerFilter: updateLayer.layerFilter
                            };
                        }
                        return layer;
                    });
                    updateProperty(widgetId, "maps", { mapId, layers: newLayers }, 'merge');
                    /*
                    if (groupsConnected) {
                        updateProperty(widgetId, "maps", { mapId, groups: value?.groups }, 'merge');
                    }
                    */
                }
            }
        }
    }),
    deleteWidget,
    editableWidget(),
    defaultIcons(),
    withHeaderTools()
);
