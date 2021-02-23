
/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { getResolutionsForScales, DEFAULT_SCREEN_DPI} from '../../../utils/MapUtils';

const mapResolutionsFromScales = (Component) => {

    return (props) => {
        const projection = "EPSG:3857";
        const dpi = DEFAULT_SCREEN_DPI;
        const scales = props?.map?.mapOptions?.view?.scales;
        const resolutions = (scales) ? (getResolutionsForScales(scales, projection, dpi)) : null;
        const initMap = (resolutions) ? {
            ...props,
            map: {
                ...props.map,
                mapOptions: {
                    ...props.mapOptions,
                    view: {
                        ...props.mapOptions.view,
                        resolutions: resolutions
                    }
                }
            }
        } : props;

        return <Component {...initMap}  />;
    };
};

export default mapResolutionsFromScales;
