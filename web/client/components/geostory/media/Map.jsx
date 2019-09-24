/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { find } from 'lodash';
import { createSelector } from 'reselect';

import { connect } from "react-redux";
import { compose, withProps, branch } from 'recompose';

import { resourcesSelector } from '../../../selectors/geostory';
import emptyState from '../../misc/enhancers/emptyState';

import MapView from '../../widgets/widget/MapView'; // TODO: use a external component

export default compose(
    branch(
        ({ resourceId }) => resourceId,
        compose(
            connect(createSelector(resourcesSelector, (resources) => ({ resources }))),
            withProps(
                ({ resources, resourceId: id }) => {
                    const resource = find(resources, { id }) || {};
                    return resource.data;
                }
            )
        ),
        emptyState(
            ({ src = "" } = {}) => !src,
            () => ({
                glyph: "map"
            })
        )
    )
)(({layers}) => <MapView

    styleMap={{height: "100%"}}
    layers={
        layers && layers.length ? layers :
        [{
            type: 'osm',
            title: 'Open Street Map',
            name: 'mapnik',
            source: 'osm',
            group: 'background',
            visibility: true,
            id: 'mapnik__0',
            loading: false,
            loadingError: false
        }]
    }
/>);
