/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';
import assign from 'object-assign';
import defaultIcon from '../img/marker-icon.png';
import {Style, Icon} from 'ol/style';

const icon = new Style({
    image: new Icon(/** @type {olx.style.IconOptions} */ {
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1,
        src: defaultIcon
    })
});

const defaultStyles = {
    'Point': [new Style({
        image: icon
    })]};

/**
 * @deprecated use VectorLayer
 */
Layers.registerType('marker', {
    create: (options, map, mapId) => {
        return Layers.createLayer('vector', assign(options, {style: () => { return defaultStyles.Point; }}), map, mapId);

    }
});
