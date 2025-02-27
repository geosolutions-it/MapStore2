/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import useIsMounted from '../../../hooks/useIsMounted';
import GeoStoreDAO from '../../../api/GeoStoreDAO';
import { castArray } from 'lodash';

/**
 * Favorites button component
 * @prop {object} user user properties
 * @prop {class|function} component a valid component
 * @prop {object} resource resource properties
 * @prop {object} location router location
 * @prop {function} onSearch trigger a refresh request after changing the favorite association
 * @prop {number} delayTime delay time to complete the request
 * @prop {string} renderType define the component type (eg. menuItem)
 */
function Favorites({
    user,
    component,
    resource,
    location,
    onSearch,
    delayTime,
    renderType
}) {
    const { query } = url.parse(location?.search || '', true);
    const f = castArray(query.f || []);
    const isMounted = useIsMounted();
    const [loading, setLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(!!resource?.isFavorite);

    function handleOnClick() {
        if (!loading) {
            setLoading(true);
            const promise = isFavorite
                ? GeoStoreDAO.removeFavoriteResource
                : GeoStoreDAO.addFavoriteResource;
            promise(user?.id, resource?.id)
                .then(() => isMounted(() => {
                    setIsFavorite(!isFavorite);
                }))
                .finally(() =>
                    setTimeout(() => isMounted(() => {
                        // apply a delay to show the spinner
                        // and give a feedback to the user
                        setLoading(false);
                        if (f.includes('favorite')) {
                            onSearch({ refresh: true });
                        }
                    }), delayTime)
                );
        }
    }
    const Component = component;
    return Component && resource?.id && user?.id
        ? (
            <Component
                glyph={isFavorite ? 'heart' : 'heart-o'}
                iconType="glyphicon"
                labelId={!loading || renderType === 'menuItem' ? `resourcesCatalog.${isFavorite ? 'removeFromFavorites' : 'addToFavorites'}` : undefined}
                square
                onClick={handleOnClick}
                loading={loading}
            />
        )
        : null;
}

Favorites.propTypes = {
    user: PropTypes.object,
    component: PropTypes.any,
    resource: PropTypes.object,
    location: PropTypes.object,
    onSearch: PropTypes.func,
    delayTime: PropTypes.number
};

Favorites.defaultProps = {
    onSearch: () => {},
    delayTime: 500
};

export default Favorites;
