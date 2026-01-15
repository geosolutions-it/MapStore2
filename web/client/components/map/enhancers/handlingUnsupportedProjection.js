/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {compose, withProps} from 'recompose';
import emptyState from '../../misc/enhancers/emptyState';
import Message from '../../I18N/Message';
import React from 'react';
import ConfigUtils from '../../../utils/ConfigUtils';

/**
 * @returns the map projection
 */
export const fetchingProjection = withProps(({map, projection}) => ({ projection: projection || (map.data && map.data.map ? map.data.map.projection : map && map.projection) }));

/**
 * @returns {function} An empty state component for the map if the projection is not supported
 */
export const handlingUnsupportedProjection = compose(
    fetchingProjection,
    emptyState(
        ({projectionDefs = ConfigUtils.getConfigProp("projectionDefs") || [], projection}) => {
            return projection && projectionDefs.concat([{code: "EPSG:4326"}, {code: "EPSG:3857"}, {code: "EPSG:900913"}]).filter(({code}) => code === projection).length === 0;
        },
        ({projection}) => ({
            glyph: "1-map",
            style: { width: "100%", height: "100%", display: "flex" },
            title: <Message msgId="map.errors.loading.title"/>,
            mainViewStyle: {margin: "auto"},
            imageStyle: {height: 120, width: 120, margin: "auto"},
            description: <Message msgId="map.errors.loading.projectionError" msgParams={{projection}}/>
        })
    )
);
