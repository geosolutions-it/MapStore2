/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon, Button } from 'react-bootstrap';

/**
 * Wrapper to apply similar style to measure toolbars
 * @name MeasureToolbar
 * @prop {node} info include this node content under the measure div info container
 * @prop {function} onClose callback to apply to the close button, the button will not be displayed if undefined
 */
function MeasureToolbar({
    children,
    info,
    onClose
}) {
    return (
        <div
            className="ms-measure-toolbar"
        >
            <div className="ms-measure-icon">
                <Glyphicon glyph="1-ruler" />
            </div>
            {children}
            <div className="ms-measure-info">
                {info}
            </div>
            {onClose ?
                <Button
                    className="square-button-md no-border"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClose();
                    }}
                >
                    <Glyphicon glyph="1-close"/>
                </Button> : null}
        </div>
    );
}

export default MeasureToolbar;
