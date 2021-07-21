/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import DrawSupport from '../../../map/openlayers/DrawSupport';

function LocalDrawSupport({
    map,
    active,
    method,
    mapId,
    mapType,
    features,
    options,
    style,
    onChange
}) {

    const [status, setStatus] = useState([]);
    useEffect(() => {
        setStatus(active ? 'drawOrEdit' : 'clean');
    }, [active]);

    if (mapType !== 'openlayers') {
        return null;
    }

    return (
        <DrawSupport
            map={map}
            drawOwner={mapId}
            drawStatus={status}
            drawMethod={method}
            features={features}
            options={{
                drawEnabled: active,
                addClickCallback: true,
                editEnabled: true,
                featureProjection: 'EPSG:4326',
                geodesic: false,
                stopAfterDrawing: false,
                transformToFeatureCollection: true,
                translateEnabled: false,
                useSelectedStyle: true,
                ...options
            }}
            onDrawingFeatures={onChange.bind(null, mapId)}
            style={style}
        />
    );
}

LocalDrawSupport.propTypes = {
    active: PropTypes.boolean,
    method: PropTypes.string,
    features: PropTypes.array,
    onChange: PropTypes.func,
    options: PropTypes.object
};

LocalDrawSupport.defaultProps = {
    active: false,
    method: 'Point',
    features: [],
    onChange: () => {},
    options: {}
};

export default LocalDrawSupport;
