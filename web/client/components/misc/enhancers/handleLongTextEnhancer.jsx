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

export const handleLongTextEnhancer = (props, RenderFormatter) => {
    const { value } = props;
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
        overlay={isContentOverflowing ? <Tooltip id="tooltip">{RenderFormatter ? <RenderFormatter {...props} /> : value}</Tooltip> : <></>}
    >
        <div ref={cellRef} onMouseEnter={handleMouseEnter}>
            <span ref={contentRef}>
                <span>{RenderFormatter ? <RenderFormatter {...props} /> : value}</span>
            </span>
        </div>
    </OverlayTrigger>);
};
