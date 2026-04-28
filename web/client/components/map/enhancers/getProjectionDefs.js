/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import {isArray} from 'lodash';

import ProjectionRegistry, { getAll } from '../../../utils/ProjectionRegistry';

/**
 * Fetches the projectionDefs from the configuration if they are not present.
 */
export function useProjectionDefs(projectionDefs) {
    if (isArray(projectionDefs) && projectionDefs.length) {
        return projectionDefs;
    }
    return getAll();
}

// Embedded contexts (dashboard widgets, geostory media) carry persisted dynamic
// projection defs inside the map config itself - no upstream epic registers them.
// Register synchronously here so the OL view never mounts before the registry
// is hydrated. Sync proj4 path; idempotent via isRegistered guard.
export const getProjectionDefs = (WrappedComponent) => {
    return (props) => {
        const defs = props?.map?.projections?.defs;
        if (defs?.length) {
            defs.forEach(def => {
                if (!ProjectionRegistry.isRegistered(def.code)) {
                    ProjectionRegistry.register(def);
                }
            });
        }
        const resolved = useProjectionDefs(props.projectionDefs);
        return <WrappedComponent {...props} projectionDefs={resolved} />;
    };
};

export default getProjectionDefs;
