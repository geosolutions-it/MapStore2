/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose, branch} from 'recompose';


import MapView from '../common/MapView'; // TODO: use a external component
import { applyDefaults } from '../../../utils/GeoStoryUtils';
import {defaultLayerMapPreview} from '../../../utils/MediaEditorUtils';

import connectMap, {withLocalMapState, withMapEditingAndLocalMapState} from '../common/enhancers/map';


export default compose(
    branch(
        ({ resourceId }) => resourceId,
        connectMap,
    ),
    withLocalMapState,
    withMapEditingAndLocalMapState
)(({
    id,
    map = {layers: [defaultLayerMapPreview]},
    fit,
    editMap = false,
    onMapViewChanges,
    eventHandlers
}) => {
    const { layers = [], mapOptions = {}, ...m} = (map.data ? map.data : map);
    return (<div
        className={`ms-media ms-media-map ${mapOptions.zoomPosition || ""}`}
        style={{
            objectFit: fit
        }}>
        {/* BaseMap component overrides the MapView id with map's id */}
        <MapView
            onMapViewChanges={onMapViewChanges}
            eventHandlers={eventHandlers}
            map={{
                ...m,
                id: `media-${id}`
            }} // if map id is passed as number, the resource id, ol throws an error
            layers={layers}
            tools={m.mapInfoControl ? ["popup"] : []}
            options={
                // mouseWheelZoom is enabled only if inlineEditing is active and zoomControl too
                applyDefaults(!editMap ? {mapOptions} : {
                    mapOptions: {
                        ...mapOptions,
                        interactions: {
                            ...mapOptions.interactions,
                            mouseWheelZoom: m.zoomControl
                        }

                    }
                })}
        />
    </div>);
});
