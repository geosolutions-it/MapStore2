/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { compose } from 'recompose';
import TOC from '../../../../../plugins/TOC/components/TOC';
import handleNodePropertyChanges from './enhancers/handleNodePropertyChanges';

const enhanceTOC = compose(
    handleNodePropertyChanges
);

function WidgetTOC({
    onSelect,
    selectedNodes,
    updateMapEntries = () => {},
    map
} = {}) {
    return (
        <TOC
            map={map}
            selectedNodes={selectedNodes}
            onSelectNode={onSelect}
            config={{
                hideOpacitySlider: false,
                showFullTitle: true,
                showOpacityTooltip: true,
                showTitleTooltip: true,
                sortable: true,
                visualizationMode: map?.visualizationMode,
                layerOptions: {
                    legendOptions: {
                        projection: map?.projection,
                        mapSize: map?.size,
                        mapBbox: map?.bbox,
                        WMSLegendOptions: 'forceLabels:on',
                        scaleDependent: true,
                        legendWidth: 12,
                        legendHeight: 12
                    },
                    hideLegend: false
                }
            }}
            onChangeMap={(newMap) => {
                updateMapEntries({
                    layers: newMap?.layers,
                    groups: newMap?.groups
                }, 'replace');
            }}
        />
    );
}

export default enhanceTOC((props) => <WidgetTOC {...props}/>);

