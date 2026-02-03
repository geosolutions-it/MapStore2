/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import trimEnd from 'lodash/trimEnd';
import max from 'lodash/max';
import axios from '../../../libs/ajax';
import Message from '../../../components/I18N/Message';
import Loader from '../../../components/misc/Loader';
import { getLayerIds, isMapServerUrl } from '../../../utils/ArcGISUtils';

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
    mapBbox: mapBboxProp = {},
    onChange = () => { }
}) {
    const [legendData, setLegendData] = useState(null);
    const [error, setError] = useState(false);
    const enableDynamicLegend = node.enableDynamicLegend && isMapServerUrl(node.url);
    const mapBbox = enableDynamicLegend ? mapBboxProp : undefined;
    const legendUrl = node.url ? `${trimEnd(node.url, '/')}/${enableDynamicLegend ? 'queryLegends' : 'legend'}` : '';


    // Get Layers id
    // @returns Array of ids
    function getLayersId() {
        const supportedLayerIds = node.name !== undefined ? getLayerIds(node.name, node?.options?.layers || []) : [];
        return supportedLayerIds;
    }

    // Get an array of legend layers
    // @param {*} layerIds Array of ids
    // @returns Layers
    function getLegendLayers(layerIds) {
        const legendLayers = (legendData?.layers || [])
            .filter(({ layerId }) => node.name === undefined ? true : layerIds.includes(`${layerId}`));
        return legendLayers;
    }

    const legendNotVisible = useMemo(() => {
        const supportedLayerIds = getLayersId();
        if (supportedLayerIds !== undefined) {
            const legendLayers = getLegendLayers(supportedLayerIds);
            return !legendLayers.some(legendLayer => legendLayer?.legend?.length > 0);
        }
        return true;
    }, [legendData, node]);

    const source = useRef();
    const requestTimeout = useRef();

    const createToken = () => {
        if (source.current) {
            source.current?.cancel();
            source.current = undefined;
        }
        const cancelToken = axios.CancelToken;
        source.current = cancelToken.source();
    };

    const clearRequestTimeout = () => {
        if (requestTimeout.current) {
            clearTimeout(requestTimeout.current);
            requestTimeout.current = undefined;
        }
    };

    useEffect(() => {
        return () => {
            clearRequestTimeout();
            createToken();
        };
    }, []);

    useEffect(() => {
        clearRequestTimeout();
        createToken();
        if (legendUrl) {
            setError(false);
            requestTimeout.current = setTimeout(() => axios.get(legendUrl, {
                params: {
                    f: 'json',
                    ...(node.enableDynamicLegend && {
                        bbox: Object.values(mapBbox.bounds ?? {}).join(',') || '',
                        bboxSR: mapBbox?.crs?.split(':')[1] ?? '',
                        size: `${(node.legendOptions?.legendWidth ?? legendWidth)},${(node.legendOptions?.legendHeight ?? legendHeight)}`,
                        format: 'png',
                        transparent: false,
                        timeRelation: 'esriTimeRelationOverlaps',
                        returnVisibleOnly: true
                    })
                },
                cancelToken: source.current.token
            })
                .then(({ data }) => {
                    const legendEmpty = data.layers.every(layer => layer.legend.length === 0);
                    onChange({ legendEmpty });
                    setLegendData(data);
                })
                .catch((err) => {
                    if (!axios.isCancel(err)) {
                        onChange({ legendEmpty: true });
                        setError(true);
                    }
                }), 300);
        }
    }, [legendUrl, mapBbox]);

    const supportedLayerIds = getLayersId();

    const legendLayers = getLegendLayers(supportedLayerIds);
    const loading = !legendData && !error;

    return (
        <div className="ms-arcgis-legend">
            {legendNotVisible && !loading && !error ? (
                <div className="ms-no-visible-layers-in-extent">
                    <Message msgId="widgets.errors.noLegend" />
                </div>
            ) : null}
            {!legendNotVisible && legendLayers.map(({ legendGroups, legend, layerName }, index) => {
                const legendItems = legendGroups
                    ? legendGroups.map(legendGroup => legend.filter(item => item.groupId === legendGroup.id)).flat()
                    : legend;
                const maxWidth = max(legendItems.map(item => item.width));
                return (<React.Fragment key={index}>
                    {legendLayers.length > 1 && <div className="ms-legend-title">{layerName}</div>}
                    <ul className="ms-legend">
                        {legendItems.map((item, idx) => {
                            const keyItem = `${item.id || item.label}-${idx}`;
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
                </React.Fragment>);
            })}
            {loading && <Loader size={12} style={{display: 'inline-block'}}/>}
            {error && !loading ? <Message msgId="layerProperties.legenderror" /> : null}
        </div>
    );
}

export default ArcGISLegend;
