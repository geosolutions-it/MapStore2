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

/**
 * A draw support interface to use as component instead of plugin
 * @prop {object} map map library instance object
 * @prop {string} mapType type of map library
 * @prop {boolean} active activate draw support
 * @prop {string} method drawing method based on geometry type (eg: Point)
 * @prop {array} features initial features to edit
 * @prop {object} options options for the draw support
 * @prop {function} onChange callback called after drawing/editing a feature
 */
function LocalDrawSupport({
    map,
    active,
    method,
    mapId,
    mapType,
    features,
    options,
    onChange,
    ...props
}) {

    const [status, setStatus] = useState(null);
    useEffect(() => {
        setStatus(active ? 'drawOrEdit' : 'clean');
    }, [active]);

    if (mapType !== 'openlayers') {
        return null;
    }

    return (
        <DrawSupport
            { ...props }
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
        />
    );
}

LocalDrawSupport.propTypes = {
    active: PropTypes.bool,
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
