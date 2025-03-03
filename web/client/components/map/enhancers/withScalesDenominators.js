
/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getResolutionsForScales } from '../../../utils/MapUtils';

/**
 * Get the Scales, by configuration and use it to compute the map resolutions
 * if scales and resolutions props are declared the scales prop has priority
 * @name withScalesDenominators
 * @memberof components.map.enhancers
 * @param {Component} Component this component is used to render the map, in the application contents: Maps, Dashboard, Geostory
 * @returns {*} the map component with the resolutions calculated by fixed scales
 * @example
 * withScalesDenominators(MapPlugin);
 */


const withScalesDenominators = (Component) => {

    return (props) => {
        const projection = props?.map?.projection || 'EPSG:3857';
        // if null the getResolutionsForScales will use DEFAULT_SCREEN_DPI automatically
        const dpi = props?.map?.mapOptions?.view?.DPI || null;
        const scales = props?.map?.mapOptions?.view?.scales;
        const resolutions = useMemo(() => (scales) ? getResolutionsForScales(scales, projection, dpi) : null, [scales, projection, dpi]);
        const mapProps = (resolutions) ? {
            ...props,
            map: {
                ...props.map,
                mapOptions: {
                    ...props.map.mapOptions,
                    view: {
                        ...props.map.mapOptions.view,
                        resolutions: resolutions
                    }
                }
            }
        } : props;

        return <Component {...mapProps} />;
    };
};

withScalesDenominators.propTypes = {
    Component: PropTypes.element
};
export default withScalesDenominators;
