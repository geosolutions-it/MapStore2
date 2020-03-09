/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { toPairs, get } from 'lodash';
import { Button, Glyphicon } from 'react-bootstrap';

import HTML from '../I18N/HTML';
import Message from '../I18N/Message';

export default ({
    show = false,
    formats = {},
    selectedFormat,
    exportButtonLabel = <Message msgId="mapExport.exportPanel.exportButtonLabel"/>,
    onSelect = () => {},
    onExport = () => {},
    onClose = () => {}
}) => (show &&
    <div className="export-panel">
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
            <div>
                <div className="export-panel-heading-icon">
                    <Glyphicon glyph="upload"/>
                </div>
                <div>
                    <HTML msgId="mapExport.exportPanel.title"/>
                </div>
                <div className="export-panel-formats-container">
                    {toPairs(formats).map(([format, {label, glyph}]) =>
                        <Button
                            key={format}
                            bsStyle="default"
                            className={selectedFormat === format ? "format-selected" : ""}
                            onClick={() => onSelect(format)}>
                            <div>
                                <Glyphicon style={{marginRight: '4px'}} glyph={glyph}/>
                                {label}
                            </div>
                        </Button>
                    )}
                </div>
                <Button bsStyle="primary" onClick={() => onExport(selectedFormat)}>{exportButtonLabel}</Button>
                <br/>
                <br/>
                {get(formats, `${selectedFormat}.description`, null)}
                {get(formats, `${selectedFormat}.note`) &&
                    <>
                        <hr/>
                        {get(formats, `${selectedFormat}.note`)}
                    </>
                }
            </div>
        </div>
    </div>
);
