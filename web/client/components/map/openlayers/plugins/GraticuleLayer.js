/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';

import Graticule from 'ol/Graticule';
import {Stroke} from 'ol/style';

Layers.registerType('graticule', {
    create: (options, map) => {
        let graticule = new Graticule({
            strokeStyle: options.style || new Stroke({
                color: 'rgba(255,120,0,0.9)',
                width: 2,
                lineDash: [0.5, 4]
            })
        });
        graticule.setMap(map);

        return {
            detached: true,
            remove: () => {
                graticule.setMap(null);
            }
        };
    }
});
