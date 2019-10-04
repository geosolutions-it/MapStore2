/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Dropzone = require('react-dropzone');
const { Button: RButton, Glyphicon } = require('react-bootstrap');

const tooltip = require('../../misc/enhancers/tooltip');
const Button = tooltip(RButton);
module.exports = ({
    accept,
    children,
    onRef = () => {},
    onClose = () => {},
    onDrop = () => {},
    onDragEnter = () => {},
    onDragLeave = () => {}
}) => (<Dropzone
    disableClick
    ref={onRef}
    id="DRAGDROP_IMPORT_ZONE"
    style={{ position: "relative", height: '100%' }}
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
            zIndex: 2000,
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

