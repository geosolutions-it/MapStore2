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
import axios from '../../../libs/ajax';
import Message from '../../../components/I18N/Message';
import Loader from '../../../components/misc/Loader';
import { getLayerIds } from '../../../utils/ArcGISUtils';

/**
 * ArcGISLegend renders legend from a MapServer or ImageServer service
 * @prop {object} node layer node options
 */
function ArcGISLegend({
    node = {}
}) {
    const [legendData, setLegendData] = useState(null);
    const [error, setError] = useState(false);
    const legendUrl = node.url ? `${trimEnd(node.url, '/')}/legend` : '';
    useEffect(() => {
        if (legendUrl) {
            axios.get(legendUrl, {
                params: {
                    f: 'json'
                }
            })
                .then(({ data }) => setLegendData(data))
                .catch(() => setError(true));
        }
    }, [legendUrl]);

    const supportedLayerIds = node.name !== undefined ? getLayerIds(node.name, node?.options?.layers || []) : [];

    const legendLayers = (legendData?.layers || [])
        .filter(({ layerId }) => node.name === undefined ? true : supportedLayerIds.includes(`${layerId}`));
    const loading = !legendData && !error;
    return (
        <div className="ms-arcgis-legend">
            {legendLayers.map(({ legendGroups, legend, layerName }) => {
                const legendItems = legendGroups
                    ? legendGroups.map(legendGroup => legend.filter(item => item.groupId === legendGroup.id)).flat()
                    : legend;
                const maxWidth = max(legendItems.map(item => item.width));
                return (<>
                    {legendLayers.length > 1 && <div className="ms-legend-title">{layerName}</div>}
                    <ul className="ms-legend">
                        {legendItems.map((item, idx) => {
                            return (<li key={idx} className="ms-legend-rule">
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
            {loading && <Loader size={12} style={{display: 'inline-block'}}/>}
            {error && <Message msgId="layerProperties.legenderror" />}
        </div>
    );
}

export default ArcGISLegend;
