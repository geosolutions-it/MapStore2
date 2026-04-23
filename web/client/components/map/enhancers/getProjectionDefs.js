/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import {isArray} from 'lodash';
// import {withProps} from "recompose";
// import ConfigUtils from '../../../utils/ConfigUtils';

// NEW CODE
import { getAll } from '../../../utils/ProjectionRegistry';

// OLD CODE
/**
 * Fetches the projectionDefs from the configuration if they are not present
 */
// export const getProjectionDefs = withProps(
//     ({projectionDefs}) => ({
//         projectionDefs: isArray(projectionDefs) && projectionDefs.length ?
//             projectionDefs :
//             ConfigUtils.getConfigProp("projectionDefs") || []
//     })
// );

export function useProjectionDefs(projectionDefs) {
    if (isArray(projectionDefs) && projectionDefs.length) {
        return projectionDefs;
    }
    return getAll();
}

// HOC wrapper retained so consumers do not need to change:
export const getProjectionDefs = (WrappedComponent) => {
    return (props) => {
        const resolved = useProjectionDefs(props.projectionDefs);
        return <WrappedComponent {...props} projectionDefs={resolved} />;
    };
};

export default getProjectionDefs;
