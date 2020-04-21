/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button: ButtonRB, Glyphicon} = require('react-bootstrap');
const PropertiesViewer = require('./row/PropertiesViewer');

const tooltip = require('../../../misc/enhancers/tooltip');

const Button = tooltip(ButtonRB);

require('../css/identify.css');

module.exports = ({response, layer, rowViewer, showEdit, onEditFeature = () => {}}) => {
    const RowViewer = (layer && layer.rowViewer) || rowViewer || PropertiesViewer;
    return (
        <div className="mapstore-json-viewer">
            {(response.features || []).map((feature, i) => {
                return (
                    <div key={i} className="identify-properties-viewer-row">
                        <RowViewer feature={feature} title={feature.id + ''} exclude={["bbox"]} {...feature.properties}/>
                        {showEdit ? <div className="identify-properties-viewer-row-buttons">
                            <Button
                                style={{marginTop: '8px'}}
                                className="square-button-md"
                                bsStyle="primary"
                                tooltipId="identifyEditFeature"
                                onClick={() => onEditFeature(feature)}>
                                <Glyphicon glyph="pencil"/>
                            </Button>
                        </div> : null}
                    </div>
                );
            })}
        </div>
    );
};
