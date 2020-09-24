/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React, {useEffect} from 'react';
import Draggable from 'react-draggable';

import EffectSupport from './EffectSupport';

let width;
let height;

const sizeHandler = {
    setWidth: (s) => {
        width = s;
    },
    getWidth: () => {
        return width;
    },
    setHeight: (s) => {
        height = s;
    },
    getHeight: () => {
        return height;
    }
};

const onDragVerticalHandler = (e, ui, map) => {
    sizeHandler.setWidth(sizeHandler.getWidth() + ui.deltaX);
    map.render();
};

const onDragHorizontalHandler = (e, ui, map) => {
    sizeHandler.setHeight(sizeHandler.getHeight() + ui.deltaY);
    map.render();
};

const DraggableSlider = ({ type, map }) => {
    useEffect(() => {
        type === "cut-vertical"
            ? sizeHandler.setWidth(map.getProperties().size[0] / 2)
            : sizeHandler.setHeight(map.getProperties().size[1] / 2);
    }, []);
    if (type === "cut-horizontal") {
        return (<Draggable axis="y" bounds="parent" onDrag={(e, ui) => onDragHorizontalHandler(e, ui, map)}>
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
        <Draggable axis="x" bounds="parent" onDrag={(e, ui) => onDragVerticalHandler(e, ui, map)}>
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
const XYSwipeSupport = ({ map, layer, type = "cut-vertical" }) => {
    if (layer) {
        return (
            <>
                <DraggableSlider
                    map={map}
                    type={type} />
                <EffectSupport
                    map={map}
                    layer={layer}
                    type={type}
                    getWidth={sizeHandler.getWidth}
                    getHeight={sizeHandler.getHeight} />
            </>);
    }
    return null;
};

export default XYSwipeSupport;
