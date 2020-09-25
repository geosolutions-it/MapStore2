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

const DraggableSlider = ({ type, map, widthRef, heightRef }) => {

    useEffect(() => {
        type === "cut-vertical"
            ? widthRef.current = map.getProperties().size[0] / 2
            : heightRef.current = map.getProperties().size[1] / 2;
    }, []);

    const onDragVerticalHandler = (e, ui) => {
        widthRef.current += ui.deltaX;
        map.render();
    };

    const onDragHorizontalHandler = (e, ui) => {
        heightRef.current += ui.deltaY;
        map.render();
    };

    if (type === "cut-horizontal") {
        return (<Draggable axis="y" bounds="parent" onDrag={(e, ui) => onDragHorizontalHandler(e, ui)}>
            <div className="mapstore-swipe-slider" style={{
                height: "12px",
                top: `${map.getProperties().size[1] / 2}px`,
                left: "0px",
                width: '100%',
                cursor: "row-resize"
            }}></div>
        </Draggable>);
    }

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

// Allow swiping in the horizontal or vertical direction
const XYSwipeSupport = ({ map, layer, type = "cut-vertical", active }) => {
    const heightRef = useRef();
    const widthRef = useRef();
    if (layer && active) {
        return (
            <>
                <DraggableSlider
                    heightRef={heightRef}
                    widthRef={widthRef}
                    map={map}
                    type={type} />
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

export default XYSwipeSupport;
