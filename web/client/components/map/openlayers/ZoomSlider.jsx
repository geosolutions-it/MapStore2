/**
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect } from 'react';
import ZoomSlider from 'ol/control/ZoomSlider';

export default function ZoomSliderComp({
    className = 'ol-zoomslider',
    duration = 200,
    map
}) {
    useEffect(() => {
        let zoomSlider = new ZoomSlider({
            className, duration
        });
        if (map) {
            map.addControl(zoomSlider);
        }
        return () => {
            if (document.querySelector(className)) {
                try {
                    map.getViewport().removeChild(document.querySelector(className));
                } catch (e) {
                    // do nothing...
                }

            }
        };
    }, []);
    return null;
}
