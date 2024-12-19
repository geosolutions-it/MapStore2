/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';
import { reprojectBbox } from '../../../utils/CoordinatesUtils';
import { getAdjustedExtent } from '../utils/ResourcesCoordinatesUtils';

const ZoomTo = ({
    map,
    extent,
    nearest = true
}) => {
    const once = useRef();
    useEffect(() => {
        if (map && extent && !once.current) {
            const [
                aMinx, aMiny, aMaxx, aMaxy,
                bMinx, bMiny, bMaxx, bMaxy
            ] = extent.split(',');
            const projection = map.getView().getProjection().getCode();
            let bounds;
            const aBounds = reprojectBbox(getAdjustedExtent([aMinx, aMiny, aMaxx, aMaxy]), 'EPSG:4326', projection);
            if (bMinx !== undefined && bMiny !== undefined && bMaxx !== undefined && bMaxy !== undefined) {
                const bBounds = reprojectBbox(getAdjustedExtent([bMinx, bMiny, bMaxx, bMaxy]), 'EPSG:4326', projection);
                // if there is the second bbox we should shift the minimum x value to correctly center the view
                // the x of the [A] bounds needs to be shifted by the width of the [B] bounds
                const minx = aBounds[0] - (bBounds[2] - bBounds[0]);
                bounds = [minx, aBounds[1], aBounds[2], aBounds[3]];
            } else {
                bounds = aBounds;
            }
            map.getView().fit(bounds, {
                size: map.getSize(),
                duration: 300,
                nearest
            });
            // ensure to avoid other fit action by setting once to true
            once.current = true;
        }
    }, [extent]);

    return null;
};

export default ZoomTo;
