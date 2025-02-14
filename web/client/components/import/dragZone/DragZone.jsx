/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import Dropzone from 'react-dropzone';
import { Glyphicon } from 'react-bootstrap';
import RButton from '../../misc/Button';
import tooltip from '../../misc/enhancers/tooltip';
const Button = tooltip(RButton);

export default ({
    accept,
    children,
    style,
    onRef = () => {},
    onClose = () => {},
    onDrop = () => {},
    onDragEnter = () => {},
    onDragLeave = () => {}
}) => (<Dropzone
    disableClick
    ref={onRef}
    id="DRAGDROP_IMPORT_ZONE"
    style={{ position: "absolute", top: 0, left: 0, height: '100%', ...style }}
    accept={accept}
    onDrop={onDrop}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}>
    <div
        style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            zIndex: 4000,
            display: 'flex',
            textAlign: 'center'
        }}>
        <Button
            style={{
                border: "none",
                background: "transparent",
                color: "white",
                fontSize: 35,
                top: 0,
                right: 0,
                position: 'absolute'
            }}
            onClick={()=> onClose()}
        ><Glyphicon glyph="1-close" />
        </Button>
        <div style={{
            margin: 'auto',
            maxWidth: 550
        }}>
            {children}
        </div>
    </div>
</Dropzone>);

