/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');

Layers.registerType('overlay', {
    create: (options, map) => {
        const cloned = document.getElementById(options.id).cloneNode(true);
        cloned.id = options.id + '-overlay';
        document.body.appendChild(cloned);
        const overlay = new ol.Overlay(({
            id: options.id,
            element: cloned,
            autoPan: options.autoPan || false,
            autoPanAnimation: {
                duration: options.autoPanAnimation || 250
            },
            position: [options.position.x, options.position.y]
        }));
        map.addOverlay(overlay);
        return {
            detached: true,
            remove: () => {
                map.removeOverlay(overlay);
            }
        };
    }
});
