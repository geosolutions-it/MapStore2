/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import TOC from "../../../plugins/TOC/components/TOC";

export default ({
    updateProperty = () => {},
    legendProps = {},
    currentZoomLvl,
    disableOpacitySlider = false,
    disableVisibility = false,
    legendExpanded = false,
    scales,
    language,
    currentLocale,
    map = { layers: [], groups: [] }
}) => {
    return (
        <TOC
            map={map}
            theme="legend"
            config={{
                sortable: false,
                showFullTitle: true,
                hideOpacitySlider: disableOpacitySlider,
                hideVisibilityButton: disableVisibility,
                expanded: legendExpanded === true ? true : undefined,
                language,
                currentLocale,
                scales,
                zoom: currentZoomLvl,
                layerOptions: {
                    legendOptions: {
                        ...legendProps,
                        projection: map?.projection,
                        mapSize: map?.size,
                        mapBbox: map?.bbox
                    },
                    hideFilter: true
                }
            }}
            onChangeMap={(newMap) => {
                updateProperty('map', newMap);
            }}
        />
    );
};
