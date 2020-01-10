/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { set } from './ImmutableUtils';


/**
 * removes quickFilters from widgets
 * @param {object} resource to clean from
 * @returns {object} resource without
 */
export const cleanResource = (resource) => {
    const widgets = (resource && resource.data && resource.data.widgets || []).map(({quickFilters, ...w}) => w );
    return set("data.widgets", widgets, resource);
};
