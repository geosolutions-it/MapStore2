/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropertiesViewer = require('./row/PropertiesViewer');

module.exports = ({response, layer, rowViewer}) => {
    const RowViewer = (layer && layer.rowViewer) || rowViewer || PropertiesViewer;
    return (
        <div className="mapstore-json-viewer">
            {(response.features || []).map((feature, i) => {
                return <RowViewer key={i} feature={feature} title={feature.id + ''} exclude={["bbox"]} {...feature.properties}/>;
            })}
        </div>
    );
};
