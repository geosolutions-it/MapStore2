/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { set } from '../../../utils/ImmutableUtils';
import find from 'lodash/find';

import { shallowEqual, withPropsOnChange } from 'recompose';

/**
 * Syncs map center
 */
export default (prop) => withPropsOnChange(
    ({ mapSync, dependencies = {}, selectedMapId } = {}, { mapSync: newMapSync, dependencies: newDependencies, selectedMapId: newSelectedMapId }) =>
        newDependencies && shallowEqual(dependencies[prop], newDependencies[prop])
            || mapSync === newMapSync
        || selectedMapId === newSelectedMapId,
    ({ maps = [], mapSync, dependencies = {}, selectedMapId }) => {
        const map = find(maps, {mapId: selectedMapId}) || {};
        const updatedMap = dependencies[prop] && mapSync ? set(prop, dependencies[prop], map) : map;
        return {
            mapStateSource: "__dependency_system__",
            maps: maps.map((m)=> m.mapId === updatedMap.mapId ? updatedMap : m),
            map: updatedMap
        };
    }
);
