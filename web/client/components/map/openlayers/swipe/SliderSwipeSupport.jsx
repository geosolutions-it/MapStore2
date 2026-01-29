/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React, {useEffect, useRef, useState} from 'react';
import {Glyphicon} from 'react-bootstrap';
import Draggable from 'react-draggable';

import EffectSupport from './EffectSupport';

const VSlider = ({ type, map, widthRef, swipeSliderOptions, onSetSwipeSliderOptions }) => {

    const [pos, setPos] = useState(swipeSliderOptions?.pos || {x: 0, y: 0});
    const [showArrows, setShowArrows] = useState(true);

    // reset the slider positon to prevent misalignment between handler and cut positions
    const onWindowResize = () => {
        // Only reset if no saved position exists
        if (!swipeSliderOptions?.pos) {
            const posToSet = {x: 0, y: 0};
            setPos(posToSet);
            onSetSwipeSliderOptions({pos: posToSet});
            widthRef.current = map.getProperties().size[0] / 2;
        } else {
            // Keep saved position but update widthRef for new map size
            widthRef.current = map.getProperties().size[0] / 2 + swipeSliderOptions.pos.x;
        }
    };

    const onDragVerticalHandler = (e, ui) => {
        widthRef.current = map.getProperties().size[0] / 2 + ui.x;
        const posToSet = {x: ui.x, y: ui.y};
        setPos(posToSet);
        onSetSwipeSliderOptions({pos: posToSet});
        map.render();
    };

    useEffect(() => {
        window.addEventListener('resize', onWindowResize);
        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, [ type ]);

    useEffect(() => {
        // Initialize based on saved position from swipe state or default to center
        const currentMapSize = map.getProperties().size;
        if (swipeSliderOptions?.pos) {
            widthRef.current = currentMapSize[0] / 2 + swipeSliderOptions.pos.x;
        } else {
            widthRef.current = currentMapSize[0] / 2;
        }
    }, [ type ]);

    return (
        <Draggable
            position={pos}
            bounds="parent"
            onStart={() => setShowArrows(false)}
            onDrag={(e, ui) => onDragVerticalHandler(e, ui)}
            onStop={() => setShowArrows(true)}>
            <div className="mapstore-swipe-slider" style={{
                height: "100%",
                top: '0px',
                left: `${map.getProperties().size[0] / 2}px`,
                width: "8px",
                cursor: "col-resize"
            }}>
                {showArrows && (
                    <div className="ms-vertical-swipe-slider-arrows" style={{
                        // subtract half of the arrows height i.e 52px so that top stops at center
                        top: `${(map.getProperties().size[1] / 2) - 26}px`
                    }}>
                        <div className="ms-slider-arrows">
                            <Glyphicon glyph="chevron-left" />
                        </div>
                        <div className="ms-slider-arrows">
                            <Glyphicon glyph="chevron-right" />
                        </div>
                    </div>
                )}
            </div>
        </Draggable>
    );
};

const HSlider = ({ type, map, heightRef, swipeSliderOptions, onSetSwipeSliderOptions }) => {

    const [pos, setPos] = useState(swipeSliderOptions?.pos || {x: 0, y: 0});
    const [showArrows, setShowArrows] = useState(true);

    const onWindowResize = () => {
        // Only reset if no saved position exists
        if (!swipeSliderOptions?.pos) {
            const posToSet = {x: 0, y: 0};
            setPos(posToSet);
            onSetSwipeSliderOptions({pos: posToSet});
            heightRef.current = map.getProperties().size[1] / 2;
        } else {
            // Keep saved position but update heightRef for new map size
            heightRef.current = map.getProperties().size[1] / 2 + swipeSliderOptions.pos.y;
        }
    };

    const onDragHorizontalHandler = (e, ui) => {
        heightRef.current = map.getProperties().size[1] / 2 + ui.y;
        const posToSet = {x: ui.x, y: ui.y};
        setPos(posToSet);
        onSetSwipeSliderOptions({pos: posToSet});
        map.render();
    };

    useEffect(() => {
        window.addEventListener('resize', onWindowResize);
        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, [ type ]);

    useEffect(() => {
        // Initialize based on saved position from swipe state or default to center
        if (swipeSliderOptions?.pos) {
            heightRef.current = map.getProperties().size[1] / 2 + swipeSliderOptions.pos.y;
        } else {
            heightRef.current = map.getProperties().size[1] / 2;
        }
    }, [ type ]);

    return (<Draggable
        position={pos}
        bounds="parent"
        onStart={() => setShowArrows(false)}
        onDrag={(e, ui) => onDragHorizontalHandler(e, ui)}
        onStop={() => setShowArrows(true)}>
        <div className="mapstore-swipe-slider" style={{
            height: "8px",
            top: `${map.getProperties().size[1] / 2}px`,
            left: "0px",
            width: '100%',
            cursor: "row-resize"
        }}>
            {showArrows && (
                <div className="ms-horizontal-swipe-slider-arrows" style={{
                    // subtract half of the arrows width i.e 52px so that left stops at center
                    left: `${(map.getProperties().size[0] / 2) - 26}px`
                }}>
                    <div className="ms-slider-arrows">
                        <Glyphicon glyph="chevron-up" />
                    </div>
                    <div className="ms-slider-arrows">
                        <Glyphicon glyph="chevron-down" />
                    </div>
                </div>
            )}
        </div>
    </Draggable>);
};

/**
 * Implementation of Horiziontal/Vertical slider swipe for OpenLayers.
 * @props {string} [type="cut-vertical"] the type of the swipe. Can be "cut-vertical" or "cut-horizontal"
 * @props {boolean} active activates the tool (if a layer is present)
 * @props {object} map the map object
 * @props {layer} the layer object
 */
const SliderSwipeSupport = ({ map, layer, type = "cut-vertical", active, swipeSliderOptions = {}, onSetSwipeSliderOptions }) => {
    const heightRef = useRef();
    const widthRef = useRef();
    if (layer && active) {
        return (
            <>
                {type === "cut-vertical" && (<VSlider swipeSliderOptions={swipeSliderOptions} onSetSwipeSliderOptions={onSetSwipeSliderOptions} widthRef={widthRef} map={map} type={type} />)}
                {type === "cut-horizontal" && (<HSlider swipeSliderOptions={swipeSliderOptions} onSetSwipeSliderOptions={onSetSwipeSliderOptions} heightRef={heightRef} map={map} type={type} />)}
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
