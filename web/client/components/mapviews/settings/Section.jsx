/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

function Section({
    title,
    children,
    initialExpanded,
    onExpand = () => {}
}) {
    const [expanded, setExpanded] = useState(initialExpanded);
    function handleExpand() {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        onExpand(newExpanded);
    }
    return (
        <>
            <div className="ms-map-views-section" >
                <Button
                    className="square-button-md no-border"
                    onClick={handleExpand}
                    style={{ borderRadius: '50%', marginRight: 4 }}
                >
                    <Glyphicon glyph={expanded ? "bottom" : "next"} />
                </Button>
                <div className="ms-map-views-section-title">
                    {title}
                </div>
            </div>
            {expanded ? <div style={{ paddingLeft: 34 }}>{children}</div> : null}
        </>
    );
}

export default Section;
