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
import { getNodeStyle } from '../utils/DynamicLegendUtils';
import ResponsivePanel from "../../../components/misc/panels/ResponsivePanel";

import CustomGroupNodeComponent from './CustomGroupNodeComponent';
import CustomLayerNodeComponent from './CustomLayerNodeComponent';
import '../assets/dynamicLegend.css';

/**
 * Main component for the DynamicLegend plugin.
 *
 * @param {Object} props
 * @param {Function} props.onUpdateNode - Function to update a layer node.
 * @param {number} props.currentZoomLvl - Current zoom level of the map.
 * @param {Function} props.onClose - Callback to close the panel.
 * @param {boolean} props.isVisible - Whether the panel is visible.
 * @param {Array} props.groups - Layer groups.
 * @param {Array} props.layers - Map layers.
 * @param {Object} props.mapBbox - Current map bounding box.
 * @param {number} props.resolution - Current map resolution.
 * @param {number} [props.size=550] - Width of the docked panel.
 * @param {Object} [props.dockStyle={}] - Custom dock style.
 * @param {boolean} [props.isFloating=false] - Whether to render in a floating modal.
 * @param {boolean} [props.flatLegend=false] - Whether to display a flat legend instead of grouped.
 * @returns {JSX.Element}
 */
const DynamicLegend = ({
    onUpdateNode,
    currentZoomLvl,
    onClose,
    isVisible,
    groups,
    mapBbox,
    resolution,
    size = 550,
    dockStyle = {},
    layers = [],
    isFloating = false,
    flatLegend = false
}) => {
    const ContainerComponent = isFloating ? ResizableModal : ResponsivePanel;
    return (
        <ContainerComponent
            {...(isFloating ? {
                onClose,
                enableFooter: false,
                title: <Message msgId="dynamiclegend.title" />,
                dialogClassName: "legend-dialog",
                show: isVisible,
                draggable: true,
                style: { zIndex: 1993 }
            } : {
                containerStyle: dockStyle,
                containerId: "dynamic-legend-container",
                containerClassName: "dock-container",
                className: "dynamic-legend-dock-panel",
                open: isVisible,
                position: "right",
                size,
                glyph: "align-left",
                title: <Message msgId="dynamiclegend.title" />,
                onClose,
                style: dockStyle
            })}
        >
            {layers.length === 0 && <Message msgId="dynamiclegend.emptyLegend" />}
            {layers.length !== 0 && <ControlledTOC
                tree={flatLegend ? layers : groups}
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
            />}
        </ContainerComponent>
    );
};

export default DynamicLegend;
