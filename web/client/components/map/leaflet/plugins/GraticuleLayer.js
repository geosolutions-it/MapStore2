/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/leaflet/Layers';
import SimpleGraticule from 'leaflet-simple-graticule/L.SimpleGraticule';

require('leaflet-simple-graticule/L.SimpleGraticule.css');

Layers.registerType('graticule', {
    create: (options) => {
        const graticuleOptions = Object.assign({
            interval: 20,
            showOriginLabel: true,
            redraw: 'move'
        }, options);
        if (SimpleGraticule) {
            return new SimpleGraticule(graticuleOptions);
        }
        return null;
    },
    isValid: () => {
        return SimpleGraticule ? true : false;
    }
});
