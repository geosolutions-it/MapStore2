/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createPlugin } from '../../utils/PluginsUtils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { userSelector } from '../../selectors/security';
import { getRouterLocation } from './selectors/resources';
import { searchResources } from './actions/resources';
import Favorites from './containers/Favorites';

const ConnectedFavorites = connect(
    createStructuredSelector({
        user: userSelector,
        location: getRouterLocation
    }),
    {
        onSearch: searchResources
    }
)(Favorites);

/**
 * renders a button inside the resource card to add/remove a resource to user favorites
 * @name Favorites
 * @class
 * @memberof plugins
 */
export default createPlugin('Favorites', {
    component: () => null,
    containers: {
        ResourcesGrid: {
            target: 'card-buttons',
            position: 0,
            Component: ConnectedFavorites
        }
    }
});
