/*
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import Message from '../../../components/I18N/Message';
import ResizableModal from '../../../components/misc/ResizableModal';
import { ControlledTOC } from '../../TOC/components/TOC';
import DefaultGroup from '../../TOC/components/DefaultGroup';
import DefaultLayer from '../../TOC/components/DefaultLayer';
import { getNodeStyle, keepLayer } from '../utils/DynamicLegendUtils';

import '../assets/dynamicLegend.css';

// keep the custom component outside of the component render function
// to avoid too many remount of the nodes
const CustomGroupNodeComponent = props => {
    return (
        <DefaultGroup {...props} />
    );
};

const CustomLayerNodeComponent = ({ node, ...props }) => {
    if (!keepLayer(node)) {
        return null;
    }
    return (
        <DefaultLayer
            {...props}
            node={{
                ...node,
                enableDynamicLegend: true,
                enableInteractiveLegend: false
            }}
        />
    );
};

const DynamicLegend = ({
    onUpdateNode,
    currentZoomLvl,
    onClose,
    isVisible,
    groups,
    mapBbox,
    resolution
}) => {

    // TODO: show message about empty legend root
    // const legendVisible = isLegendGroupVisible(groups.length === 1 ? groups[0] : { nodes: groups }, resolution);

    return (
        <ResizableModal
            onClose = {onClose}
            enableFooter={false}
            title={<Message msgId="dynamiclegend.title" />}
            dialogClassName=" legend-dialog"
            show={isVisible}
            draggable
            style={{zIndex: 1993}}>
            <ControlledTOC
                tree={groups}
                getNodeStyle={(node, nodeType) => getNodeStyle(node, nodeType, resolution)}
                className="legend-content"
                theme="legend"
                onChange={onUpdateNode}
                groupNodeComponent={CustomGroupNodeComponent}
                layerNodeComponent={CustomLayerNodeComponent}
                config={{
                    sortable: false,
                    showFullTitle: true,
                    hideOpacitySlider: true,
                    hideVisibilityButton: true,
                    expanded: true,
                    zoom: currentZoomLvl,
                    layerOptions: {
                        legendOptions: {
                            WMSLegendOptions: "countMatched:true;fontAntiAliasing:true;",
                            legendWidth: 12,
                            legendHeight: 12,
                            mapBbox
                        }
                    }
                }}
            />
        </ResizableModal>
    );
};

export default DynamicLegend;
