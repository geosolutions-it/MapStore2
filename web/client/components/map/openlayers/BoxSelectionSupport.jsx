/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {useEffect} from 'react';
import Select from 'ol/interaction/Select';
import DragBox from 'ol/interaction/DragBox';

let select;
let dragBox;

const BoxSelectionSupport = (props) => {
    const { map, onBoxEnd, status } = props;

    useEffect(() => {
        if (status === "start") {
            select = new Select();
            console.log("SLELE", select);
            dragBox = new DragBox({});
            map.addInteraction(select);
            map.addInteraction(dragBox);
        } else if (status === "end") {
            map.removeInteraction(select);
            map.removeInteraction(dragBox);
        }
    }, [status]);

    useEffect(() => {
        if (dragBox) {

            // TODO: Pass some more information from event to the onBoxEnd function
            dragBox.on('boxend', () => {
                onBoxEnd({
                    boxExtent: dragBox.getGeometry().getExtent()
                });
            });
        }
    }, [status]);

    return null;
};

export default BoxSelectionSupport;
