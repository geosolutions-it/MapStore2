/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

import { applyDefaults, MediaTypes } from '../../../utils/GeoStoryUtils';
import {defaultLayerMapPreview} from '../../../utils/MediaEditorUtils';

import emptyState from '../../misc/enhancers/emptyState';
import MapView from '../../widgets/builder/wizard/map/PreviewMap';
import { isEmpty } from 'lodash';

const Preview = ({
    selectedItem
}) => {
    const { layers = [], mapOptions, ...m} = selectedItem.data ? selectedItem.data : selectedItem; // remove mapOptions to not override options
    /**
     * On map change, we have to force the remount of the map to prevent Ol to add display: none to canvas
     *  this will also recreate a correct ol mapView with current map extent.
     */
    return (
        [<MapView
            key={m.id || m.mapId}
            styleMap={{height: "100%"}}
            map={{...m, id: "map" + m.id}}
            id={"preview" + selectedItem.id}
            layers={layers || [defaultLayerMapPreview]}
            options={applyDefaults({})}
        />]
    );
};

export default emptyState(
    ( {mediaType, selectedItem}) => mediaType === MediaTypes.MAP && (!selectedItem || isEmpty(selectedItem)),
    {
        iconFit: true,
        glyph: "1-map",
        imageStyle: {display: "flex", flexDirection: "column", justifyContent: "center"}
    }
)(Preview);
