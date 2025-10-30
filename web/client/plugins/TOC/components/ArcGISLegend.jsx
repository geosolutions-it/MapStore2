/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import trimEnd from 'lodash/trimEnd';
import max from 'lodash/max';
import assign from 'object-assign';
import axios from '../../../libs/ajax';
import Message from '../../../components/I18N/Message';
import Loader from '../../../components/misc/Loader';
import { getLayerIds } from '../../../utils/ArcGISUtils';

/**
 * ArcGISLegend renders a legend from a MapServer or ImageServer service.
 * It fetches legend data from the specified service URL and displays the legend items for each layer.
 * The component supports dynamic legends and custom layer visibility based on the provided bounding box and layer options.
 *
 * @component
 * @param {Object} props - The component's props.
 * @param {Object} props.node - The layer node object that contains the configuration for the legend.
 * @param {number} [props.legendWidth=12] - The width of the legend symbols (in pixels). Default is 12.
 * @param {number} [props.legendHeight=12] - The height of the legend symbols (in pixels). Default is 12.
 * @param {Object} [props.mapBbox={}] - The map bounding box, which defines the geographic extent for fetching the legend data. The `mapBbox.bounds` should contain the bounding coordinates and `mapBbox.crs` should contain the coordinate reference system.
 * @param {Function} [props.onChange=() => {}] - A callback function that is called when the legend state changes, e.g., when no visible layers are found or the legend data is fetched successfully. It receives an object with `legendEmpty` as a property, indicating whether the legend has any visible layers.
 *
 * @returns {React.Element} The rendered component.
 */
function ArcGISLegend({
    node = {},
    legendWidth = 12,
    legendHeight = 12,
    mapBbox = {},
    onChange = () => {}
}) {
    const [legendData, setLegendData] = useState(null);
    const [error, setError] = useState(false);
    const legendUrl = node.url ? `${trimEnd(node.url, '/')}/${node.enableDynamicLegend ? 'queryLegends' : 'legend'}` : '';
    useEffect(() => {
        if (legendUrl) {
            axios.get(legendUrl, {
                params: assign({
                    f: 'json'
                }, node.enableDynamicLegend ? {
                    bbox: Object.values(mapBbox.bounds ?? {}).join(',') || '',
                    bboxSR: mapBbox?.crs?.split(':')[1] ?? '',
                    // layers: 'show:' + node.options.layers.map(layer => layer.id).join(','),
                    size: `${(node.legendOptions?.legendWidth ?? legendWidth)},${(node.legendOptions?.legendHeight ?? legendHeight)}`,
                    format: 'png',
                    transparent: false,
                    timeRelation: 'esriTimeRelationOverlaps',
                    returnVisibleOnly: true
                } : {})
            })
                .then(({ data }) => {
                    const legendEmpty = data.layers.every(layer => layer.legend.length === 0);
                    console.log(data);
                    onChange({ legendEmpty });
                    setLegendData(data);
                })
                .catch(() => {
                    console.error('API call failed'); // Debugging
                    onChange({ legendEmpty: true });
                    setError(true);
                });
        }
    }, [legendUrl, mapBbox]);

    const supportedLayerIds = node.name !== undefined ? getLayerIds(node.name, node?.options?.layers || []) : [];

    const legendLayers = (legendData?.layers || [])
        .filter(({ layerId }) => node.name === undefined ? true : supportedLayerIds.includes(`${layerId}`));
    const loading = !legendData && !error;
    const noVisibleLayers = legendLayers.length === 0;
    return (
        <div className="ms-arcgis-legend">
            {noVisibleLayers && (
                <div className="ms-no-visible-layers-in-extent">
                    <Message msgId="dynamiclegend.noLayersVisibleInExtent" />
                </div>
            )}
            {legendLayers.map(({ legendGroups, legend, layerName }) => {
                const legendItems = legendGroups
                    ? legendGroups.map(legendGroup => legend.filter(item => item.groupId === legendGroup.id)).flat()
                    : legend;
                const maxWidth = max(legendItems.map(item => item.width));
                return (<>
                    {legendLayers.length > 1 && <div className="ms-legend-title">{layerName}</div>}
                    <ul className="ms-legend">
                        {legendItems.map((item) => {
                            const keyItem = item.id || item.label;
                            return (<li key={keyItem} className="ms-legend-rule">
                                <div className="ms-legend-icon" style={{ minWidth: maxWidth }}>
                                    <img
                                        src={`data:${item.contentType};base64,${item.imageData}`}
                                        width={item.width}
                                        height={item.height}
                                    />
                                </div>
                                {item.label}
                            </li>);
                        })}
                    </ul>
                </>);
            })}
            {loading && <Loader size={12} style={{display: 'inline-block'}} className={'mapstore-loader'}/>}
            {error && <Message msgId="layerProperties.legenderror" />}
        </div>
    );
}

export default ArcGISLegend;
