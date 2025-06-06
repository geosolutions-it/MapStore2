import React from 'react';
import { keepNode, isLayerVisible } from '../../../selectors/dynamiclegend';
import { getResolutions } from '../../../utils/MapUtils';
import Message from '../../../components/I18N/Message';
import ResizableModal from '../../../components/misc/ResizableModal';
import { ControlledTOC } from '../../TOC/components/TOC';
import DefaultGroup from '../../TOC/components/DefaultGroup';
import DefaultLayer from '../../TOC/components/DefaultLayer';

import '../assets/dynamicLegend.css';

function applyVersionParamToLegend(layer) {
    // we need to pass a parameter that invalidate the cache for GetLegendGraphic
    // all layer inside the dataset viewer apply a new _v_ param each time we switch page
    return { ...layer, legendParams: { ...layer?.legendParams, _v_: layer?._v_ } };
}

function filterNode(node, currentResolution) {
    const nodes = Array.isArray(node.nodes) ? node.nodes.filter(keepNode).map(applyVersionParamToLegend).map(n => filterNode(n, currentResolution)) : undefined;

    return {
        ...node,
        isVisible: (node.visibility ?? true) && (nodes ? nodes.length > 0 && nodes.some(n => n.isVisible) : isLayerVisible(node, currentResolution)),
        ...(nodes && { nodes })
    };
}

export default ({
    layers,
    onUpdateNode,
    currentZoomLvl,
    onClose,
    isVisible,
    groups,
    mapBbox
}) => {
    const layerDict = layers.reduce((acc, layer) => ({
        ...acc,
        ...{
            [layer.id]: {
                ...layer,
                ...{enableDynamicLegend: true, enableInteractiveLegend: false}
            }
        }
    }), {});
    const getVisibilityStyle = nodeVisibility => ({
        opacity: nodeVisibility ? 1 : 0,
        height: nodeVisibility ? "auto" : "0"
    });

    const customGroupNodeComponent = props => (
        <div style={getVisibilityStyle(props.node?.isVisible ?? true)}>
            <DefaultGroup {...props} />
        </div>
    );
    const customLayerNodeComponent = props => {
        const layer = layerDict[props.node.id];
        if (!layer) {
            return null;
        }

        return (
            <div style={getVisibilityStyle(props.node?.isVisible ?? true)}>
                <DefaultLayer {...props} node={layer} />
            </div>
        );
    };

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
                tree={[filterNode(groups[0] ?? {}, getResolutions()[Math.round(currentZoomLvl)])]}
                className="legend-content"
                theme="legend"
                onChange={onUpdateNode}
                groupNodeComponent={customGroupNodeComponent}
                layerNodeComponent={customLayerNodeComponent}
                config={{
                    sortable: false,
                    showFullTitle: true,
                    hideOpacitySlider: true,
                    hideVisibilityButton: true,
                    expanded: true,
                    zoom: currentZoomLvl,
                    layerOptions: {
                        enableDynamicLegend: true,
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
