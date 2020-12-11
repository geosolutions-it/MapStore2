/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {useEffect} from 'react';
import DragBox from 'ol/interaction/DragBox';

let dragBox;

const BoxSelectionSupport = (props) => {
    const { map, onBoxEnd, status } = props;

    useEffect(() => {
        if (status === "start") {
            dragBox = new DragBox({
                condition: function(mapBrowserEvent) {
                    const originalEvent = (mapBrowserEvent.originalEvent);
                    return (originalEvent.altKey);
                }
            });
            map.addInteraction(dragBox);
        } else if (status === "end") {
            map.removeInteraction(dragBox);
        }
    }, [status]);

    useEffect(() => {
        if (dragBox) {
            dragBox.on('boxend', (event) => {
                onBoxEnd({
                    boxExtent: dragBox.getGeometry().getExtent(),
                    modifiers: {
                        ctrl: event.mapBrowserEvent.pointerEvent.ctrlKey,
                        metaKey: event.mapBrowserEvent.pointerEvent.metaKey // MAC OS
                    }
                });
            });
        }
    }, [status]);

    return null;
};

export default BoxSelectionSupport;
