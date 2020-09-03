/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * selects featuredmaps state
 * @name featuredmaps
 * @memberof selectors
 * @static
 */
const { get } = require('lodash');
module.exports = {
    /**
     * invalidation flag, triggers featuredmaps reload when changed
     * @memberof selectors.featuredmaps
     * @param {object} state applications state
     * @return {boolean} invalidation flag value
     */
    invalidationSelector: state => state && state.featuredmaps && state.featuredmaps.invalidate || false,
    /**
     * selects searchText from featuredmaps, it's updated only on map list loading (press enter on search map)
     * @memberof selectors.featuredmaps
     * @param  {object}  state applications state
     * @return {string}  current searched text
     */
    searchTextSelector: state => state && state.featuredmaps && state.featuredmaps.searchText || '',
    /**
     * selects flag for featuredmaps enabled
     * @memberof selectors.featuredmaps
     * @param  {object}  state applications state
     * @return {boolean}  current searched text
     */
    isFeaturedMapsEnabled: state => get(state, "featuredmaps.enabled")

};

