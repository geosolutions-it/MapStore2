/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { useEffect, useCallback } from 'react';

const verticalCut = (layer, verticalCutPrecomposeCallback, postcomposeCallback) => {
    layer.on('precompose', verticalCutPrecomposeCallback);
    layer.on('postcompose', postcomposeCallback);
};

const horizontalCut = (layer, horizontalCutPrecomposeCallback, postcomposeCallback) => {
    layer.on('precompose', horizontalCutPrecomposeCallback);
    layer.on('postcompose', postcomposeCallback);
};

const circleCut = (layer, circleCutPrecomposeCallback, postcomposeCallback) => {
    layer.on('precompose', circleCutPrecomposeCallback);
    layer.on('postcompose', postcomposeCallback);
};

const EffectSupport = ({ map, layer: layerId, type, getWidth, getHeight, circleCutProp }) => {
    const verticalCutPrecomposeCallback = useCallback((event) => {
        let ctx = event.context;
        const width = getWidth();
        ctx.save();
        ctx.beginPath();
        ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.clip();
    }, [ layerId, type ]);

    const postcomposeCallback = useCallback((event) => {
        let ctx = event.context;
        ctx.restore();
    }, [ layerId, type ]);

    const horizontalCutPrecomposeCallback = useCallback((event) => {
        let ctx = event.context;
        const height = getHeight();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, height, ctx.canvas.width, ctx.canvas.height - height);
        ctx.clip();
    }, [ layerId, type ]);

    const circleCutPrecomposeCallback = useCallback((event) => {
        let ctx = event.context;
        let pixelRatio = event.frameState.pixelRatio;
        ctx.save();
        ctx.beginPath();
        const mousePosition = circleCutProp.getMousePosition();
        if (mousePosition) {
            // only show a circle around the mouse
            ctx.arc(mousePosition[0] * pixelRatio, mousePosition[1] * pixelRatio,
                circleCutProp.radius * pixelRatio, 0, 2 * Math.PI);
            ctx.lineWidth = 5 * pixelRatio;
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.stroke();
        }
        ctx.clip();
    }, [ layerId, type, circleCutProp ]);

    useEffect(() => {
        const layers = map.getLayers().getArray();
        const layer = layers.filter(l => l.get('msId') === layerId)[0];
        if (layer) {
            switch (type) {
            case "cut-vertical":
                verticalCut(layer, verticalCutPrecomposeCallback, postcomposeCallback);
                break;
            case "cut-horizontal":
                horizontalCut(layer, horizontalCutPrecomposeCallback, postcomposeCallback);
                break;
            case "circle":
                circleCut(layer, circleCutPrecomposeCallback, postcomposeCallback);
                break;
            default:
                break;
            }
            map.render();
            return () => {
                layer.un('precompose', verticalCutPrecomposeCallback);
                layer.un('precompose', horizontalCutPrecomposeCallback);
                layer.un('precompose', circleCutPrecomposeCallback);
                layer.un('postcompose', postcomposeCallback);
                map.render();
            };
        }
        return () => map.render();
    }, [ layerId, type, circleCutProp ]);
    return null;
};

export default EffectSupport;
