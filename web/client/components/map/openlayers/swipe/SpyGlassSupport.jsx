/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, {useEffect, useCallback, useRef} from 'react';

import EffectSupport from './EffectSupport';

/**
 * Implementation of SpyGlassSupport for OpenLayers.
 * @props {string} [type="circle"] the type of the effect.
 * @props {boolean} active activates the tool (if a layer is present)
 * @props {object} map the map object
 * @props {layer} the layer object
 */
const SpyGlassSupport = ({ layer, map, active, radius }) => {
    const mousePosition = useRef();
    const mousemoveCallback = useCallback((event) => {
        mousePosition.current = map.getEventPixel(event);
        map.render();
    }, [ layer, radius ]);

    const mouseoutCallback = useCallback(() => {
        mousePosition.current = null;
        map.render();
    }, [ layer, radius ]);

    useEffect(() => {
        const container = map.getTargetElement();
        container.addEventListener('mousemove', mousemoveCallback);
        container.addEventListener('mouseout', mouseoutCallback);
        return () => {
            container.removeEventListener('mousemove', mousemoveCallback);
            container.removeEventListener('mouseout', mouseoutCallback);
        };
    }, []);

    const circleCutProp = {
        radius,
        getMousePosition: () => mousePosition.current
    };

    if (layer && active) {
        return (
            <EffectSupport
                map={map}
                layer={layer}
                type="circle"
                circleCutProp={circleCutProp} />);
    }
    return null;
};

export default SpyGlassSupport;
