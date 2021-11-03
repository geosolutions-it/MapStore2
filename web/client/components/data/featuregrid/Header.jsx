/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Button from '../../misc/Button';


export default (props = {
    onDownloadToggle: () => {}
}) => {
    return (
        <div
            className="data-grid-top-toolbar"
        >
            <div className="data-grid-top-toolbar-left">
                {props.children}
            </div>
            {!props.hideLayerTitle && <div
                className="data-grid-top-toolbar-title"
            >
                {props.title}
            </div>}
            <div className="data-grid-top-toolbar-right">
                {!props.hideCloseButton && <Button
                    onClick={props.onClose}
                    className="square-button-md no-border featuregrid-top-toolbar-margin"
                >
                    <Glyphicon glyph="1-close"/>
                </Button>}
            </div>
        </div>
    );
};
