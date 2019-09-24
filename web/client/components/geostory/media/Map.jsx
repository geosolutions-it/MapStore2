/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { find, merge } from 'lodash';
import { createSelector } from 'reselect';

import { connect } from "react-redux";
import { compose, withProps, branch } from 'recompose';

import { resourcesSelector } from '../../../selectors/geostory';

import MapView from '../../widgets/widget/MapView'; // TODO: use a external component
import { defaultLayerMapPreview } from '../../../utils/GeoStoryUtils';
// TODO MOVE TO UTILS (SHARED WITH PREVIEW)
const DEFAULT_OPTIONS = {
    zoomControl: true,
    style: {width: "100%", height: "100%"},
    mapOptions: {
        interactions: {
            mouseWheelZoom: false
        }
    }
};
// TODO MOVE TO UTILS (SHARED WITH PREVIEW)
const applyDefaults = (options = {}) => merge({}, options, DEFAULT_OPTIONS);
// TODO MOVE TO UTILS (SHARED WITH PREVIEW)
const createMapObject = (baseMap = {}, overrides = {}) => {
    return merge({}, baseMap, overrides);
};
export default compose(
    branch(
        ({ resourceId }) => resourceId,
        compose(
            connect(createSelector(resourcesSelector, (resources) => ({ resources }))),
            withProps(
                ({ resources, resourceId: id, map = {} }) => {
                    const resource = find(resources, { id }) || {};
                    return { map: createMapObject(resource.data, map) };
                }
            )
        )
    )
)(({
    id,
    map = {layers: [defaultLayerMapPreview]},
    options = {},
    fit
}) => {
    const { layers = [], mapOptions, ...m} = map; // remove mapOptions to not override options
    return (<div
        className="ms-media ms-media-map" style={{
            objectFit: fit
        }}>
            <MapView
                id={"media" + id}
                map={{...m, id: "map" + map.id}} // if map id is passed as number, the resource id, ol throws an error
                layers={layers}
                options={applyDefaults(options)}
            />
        </div>);
});
