/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { useEffect, useCallback } from 'react';

const verticalCut = (layer, verticalCutPrerenderCallback, postrenderCallback) => {
    layer.on('prerender', verticalCutPrerenderCallback);
    layer.on('postrender', postrenderCallback);
};

const horizontalCut = (layer, horizontalCutPrerenderCallback, postrenderCallback) => {
    layer.on('prerender', horizontalCutPrerenderCallback);
    layer.on('postrender', postrenderCallback);
};

const circleCut = (layer, circleCutPrerenderCallback, postrenderCallback) => {
    layer.on('prerender', circleCutPrerenderCallback);
    layer.on('postrender', postrenderCallback);
};

const EffectSupport = ({ map, layer: layerId, type, getWidth, getHeight, circleCutProp }) => {
    const verticalCutPrerenderCallback = useCallback((event) => {
        let ctx = event.context;
        const width = getWidth() * map.pixelRatio_;
        ctx.save();
        ctx.beginPath();
        ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.clip();
    }, [ layerId, type ]);

    const postrenderCallback = useCallback((event) => {
        let ctx = event.context;
        ctx.restore();
    }, [ layerId, type ]);

    const horizontalCutPrerenderCallback = useCallback((event) => {
        let ctx = event.context;
        const height = getHeight() * map.pixelRatio_;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, height, ctx.canvas.width, ctx.canvas.height - height);
        ctx.clip();
    }, [ layerId, type ]);

    const circleCutPrerenderCallback = useCallback((event) => {
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
                verticalCut(layer, verticalCutPrerenderCallback, postrenderCallback);
                break;
            case "cut-horizontal":
                horizontalCut(layer, horizontalCutPrerenderCallback, postrenderCallback);
                break;
            case "circle":
                circleCut(layer, circleCutPrerenderCallback, postrenderCallback);
                break;
            default:
                break;
            }
            map.render();
            return () => {
                layer.un('prerender', verticalCutPrerenderCallback);
                layer.un('prerender', horizontalCutPrerenderCallback);
                layer.un('prerender', circleCutPrerenderCallback);
                layer.un('postrender', postrenderCallback);
                map.render();
            };
        }
        return () => map.render();
    }, [ layerId, type, circleCutProp ]);
    return null;
};

export default EffectSupport;
