const isLayer = node => node.nodeType === "layers";

export const keepLayer = layer => (layer.group !== 'background' && ['wms', 'arcgis'].includes(layer.type));

export const keepNode = node => !isLayer(node) || keepLayer(node);

export const isLayerVisible = (node, currentResolution) => keepLayer(node)
    && (!node.hasOwnProperty('dynamicLegendIsEmpty') || !node.dynamicLegendIsEmpty)
    && (
        (!node.minResolution || node.minResolution <= currentResolution) &&
        (!node.maxResolution || node.maxResolution > currentResolution)
    );
