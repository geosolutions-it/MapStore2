/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose, branch, withHandlers} from 'recompose';
import uuid from "uuid";

import MapView from '../../widgets/widget/MapView'; // TODO: use a external component
import { applyDefaults } from '../../../utils/GeoStoryUtils';
import {defaultLayerMapPreview} from '../../../utils/MediaEditorUtils';

import connectMap from '../common/enhancers/map';


// current implementation will update the map only if the movement
// between 12 decimals in the reference system to avoid rounded value
// changes due to float mathematic operations.
const isNearlyEqual = function(a, b) {
    if (a === undefined || b === undefined) {
        return false;
    }
    return a.toFixed(12) - b.toFixed(12) === 0;
};

export default compose(
    branch(
        ({ resourceId }) => resourceId,
        connectMap,
    ),
    withHandlers({
        onMapViewChanges: ({ map: {center = {}, zoom} = {}, editMap = false, update = () => {}}) => ({center: newCenter, zoom: newZoom}) => {
            const equalCenter =  isNearlyEqual(newCenter.x, center.x) && isNearlyEqual(newCenter.y, center.y);

            editMap && (!equalCenter || zoom !== newZoom) && update("map", {
                center: newCenter,
                zoom: newZoom,
                mapStateSource: uuid()
            }, 'merge');
        }
    }),
)(({
    id,
    map = {layers: [defaultLayerMapPreview]},
    fit,
    editMap = false,
    onMapViewChanges
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
            map={{
                ...m,
                id: `media-${id}`
            }} // if map id is passed as number, the resource id, ol throws an error
            layers={layers}
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
