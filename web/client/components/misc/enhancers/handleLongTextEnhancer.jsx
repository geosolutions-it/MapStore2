/*
* Copyright 2023, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from "react";
import OverlayTrigger from "../OverlayTrigger";
import { Tooltip } from "react-bootstrap";
/**
 * handleLongTextEnhancer enhancer. Enhances a long text content by adding a tooltip.
 * @type {function}
 * @name handleLongTextEnhancer
 * @memberof components.misc.enhancers
 * Wraps [wrapped component with content] to add tooltip for long content if shown content less than the main content
 * @param {Component} Wrapped the component wrapped with a tooltip when its content is too long
 * @param {object} props the props that contains value content
 * @return {Component} the rendered component that renders the content with the tooltip if the content is long or renders the content with no tooltip if not long
 * @example
 * const wrapper = () = > <span>testtttttttttt</span>
 * const Component = ()=> handleLongTextEnhancer(wrapper)(props);
 * render (){
 * return <Component />
 * }
 *
 */
export const handleLongTextEnhancer = (Wrapped) => (props) => {
    const cellRef = React.useRef(null);
    const contentRef = React.useRef(null);
    const [isContentOverflowing, setIsContentOverflowing] = React.useState(false);

    const handleMouseEnter = () => {
        const cellWidth = cellRef.current.offsetWidth;
        const contentWidth = contentRef.current.offsetWidth;
        setIsContentOverflowing(contentWidth > cellWidth);
    };

    return (<OverlayTrigger
        placement="top"
        overlay={isContentOverflowing ? <Tooltip id="tooltip">{<Wrapped {...props} />}</Tooltip> : <></>}
    >
        <div ref={cellRef} onMouseEnter={handleMouseEnter}>
            <span ref={contentRef}>
                <span>{<Wrapped {...props} />}</span>
            </span>
        </div>
    </OverlayTrigger>);
};
