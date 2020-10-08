/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React, {useEffect, useRef } from 'react';
import Draggable from 'react-draggable';

import EffectSupport from './EffectSupport';

const VSlider = ({ type, map, widthRef }) => {

    useEffect(() => {
        widthRef.current = map.getProperties().size[0] / 2;
    }, [ type ]);

    const onDragVerticalHandler = (e, ui) => {
        widthRef.current += ui.deltaX;
        map.render();
    };

    return (
        <Draggable axis="x" bounds="parent" onDrag={(e, ui) => onDragVerticalHandler(e, ui)}>
            <div className="mapstore-swipe-slider" style={{
                height: "100%",
                top: '0px',
                left: `${map.getProperties().size[0] / 2}px`,
                width: "12px",
                cursor: "col-resize"
            }}></div>
        </Draggable>
    );
};

const HSlider = ({ type, map, heightRef }) => {

    useEffect(() => {
        heightRef.current = map.getProperties().size[1] / 2;
    }, [ type ]);

    const onDragHorizontalHandler = (e, ui) => {
        heightRef.current += ui.deltaY;
        map.render();
    };
    return (<Draggable axis="y" bounds="parent" onDrag={(e, ui) => onDragHorizontalHandler(e, ui)}>
        <div className="mapstore-swipe-slider" style={{
            height: "12px",
            top: `${map.getProperties().size[1] / 2}px`,
            left: "0px",
            width: '100%',
            cursor: "row-resize"
        }}></div>
    </Draggable>);
};

/**
 * Implementation of Horiziontal/Vertical slider swipe for OpenLayers.
 * @props {string} [type="cut-vertical"] the type of the swipe. Can be "cut-vertical" or "cut-horizontal"
 * @props {boolean} active activates the tool (if a layer is present)
 * @props {object} map the map object
 * @props {layer} the layer object
 */
const SliderSwipeSupport = ({ map, layer, type = "cut-vertical", active }) => {
    const heightRef = useRef();
    const widthRef = useRef();
    if (layer && active) {
        return (
            <>
            {type === "cut-vertical" && (<VSlider widthRef={widthRef} map={map} type={type} />)}
            {type === "cut-horizontal" && (<HSlider heightRef={heightRef} map={map} type={type} />)}
                <EffectSupport
                    map={map}
                    layer={layer}
                    type={type}
                    getWidth={() => widthRef.current}
                    getHeight={() => heightRef.current} />
            </>);
    }
    return null;
};

export default SliderSwipeSupport;
