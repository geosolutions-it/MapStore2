/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {useEffect} from 'react';
const L = require('leaflet');
require('leaflet-draw');

const {boundsToOLExtent} = require('../../../utils/leaflet/DrawSupportUtils');

let rect;

const BoxSelectionSupport = (props) => {
    const { map, onBoxEnd, status } = props;

    useEffect(() => {
        if (status === 'start') {
            rect = new L.Draw.Rectangle(map, { repeatMode: true });
            rect.enable();
        } else if (status === 'end') {
            rect.disable();
            rect = null;
        }
    }, [status]);

    useEffect(() => {
        if (status === 'start') {
        // TODO: Pass some more information from event to the onBoxEnd function
            map.on('draw:created', (event) => {
                const layer = event.layer;
                onBoxEnd({
                    boxExtent: layer ? boundsToOLExtent(layer.getBounds()) : []
                });
            });
        }

        if (status === "end") {
            map.off('draw:created');
        }
    }, [status]);

    return null;
};

export default BoxSelectionSupport;
