/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
    Button,
    FormGroup,
    ControlLabel
} from 'react-bootstrap';
import FormControl from '../../misc/DebouncedFormControl';
import Section from './Section';
import { isNil } from 'lodash';
import Message from '../../I18N/Message';

const formatDegrees = (value) => !isNil(value) ? parseFloat(value.toFixed(6)) : value;
const formatHeight = (value) => !isNil(value) ? Math.round(value) : value;

function PositionsSection({
    view,
    expandedSections = {},
    onExpandSection,
    onChange,
    onCaptureView,
    computeViewCoordinates
}) {
    const {
        center,
        cameraPosition
    } = view || {};

    function handleCoordinatesUpdate(updatedValues) {
        const updatedCoordinates = computeViewCoordinates(view, { cameraPosition, center, ...updatedValues });
        onChange(updatedCoordinates);
    }

    return (
        <Section
            title={<Message msgId="mapViews.position"/>}
            initialExpanded={expandedSections.positions}
            onExpand={(expanded) => onExpandSection({ positions: expanded })}
        >
            {computeViewCoordinates && <>
                <div className="ms-map-views-position-container">
                    <div className="ms-map-views-position-title"><Message msgId="mapViews.cameraPosition"/></div>
                    <div className="ms-map-views-position-group">
                        <FormGroup controlId="map-views-camera-position-lng" >
                            <ControlLabel><Message msgId="mapViews.longitude"/></ControlLabel>
                            <FormControl
                                type="number"
                                className="coordinate-field"
                                min={-180}
                                max={180}
                                step={0.00001}
                                value={formatDegrees(cameraPosition?.longitude)}
                                onChange={(value) => handleCoordinatesUpdate({ cameraPosition: { ...cameraPosition, longitude: parseFloat(value) } })}
                            />
                        </FormGroup>
                        <FormGroup controlId="map-views-camera-position-lat">
                            <ControlLabel><Message msgId="mapViews.latitude"/></ControlLabel>
                            <FormControl
                                type="number"
                                className="coordinate-field"
                                min={-90}
                                max={90}
                                step={0.00001}
                                value={formatDegrees(cameraPosition?.latitude)}
                                onChange={(value) => handleCoordinatesUpdate({ cameraPosition: { ...cameraPosition, latitude: parseFloat(value) } })}
                            />
                        </FormGroup>
                        <FormGroup controlId="map-views-camera-position-height">
                            <ControlLabel><Message msgId="mapViews.height"/></ControlLabel>
                            <FormControl
                                type="number"
                                className="height-field"
                                value={formatHeight(cameraPosition?.height)}
                                onChange={(value) => handleCoordinatesUpdate({ cameraPosition: { ...cameraPosition, height: parseFloat(value) } })}
                            />
                        </FormGroup>
                    </div>
                </div>
                <div className="ms-map-views-position-container">
                    <div className="ms-map-views-position-title"><Message msgId="mapViews.centerPosition"/></div>
                    <div className="ms-map-views-position-group">
                        <FormGroup controlId="map-views-center-position-lng">
                            <ControlLabel><Message msgId="mapViews.longitude"/></ControlLabel>
                            <FormControl
                                type="number"
                                className="coordinate-field"
                                min={-180}
                                max={180}
                                step={0.00001}
                                value={formatDegrees(center?.longitude)}
                                onChange={(value) => handleCoordinatesUpdate({ center: { ...center, longitude: parseFloat(value) } })}
                            />
                        </FormGroup>
                        <FormGroup controlId="map-views-center-position-lat">
                            <ControlLabel><Message msgId="mapViews.latitude"/></ControlLabel>
                            <FormControl
                                type="number"
                                className="coordinate-field"
                                min={-90}
                                max={90}
                                step={0.00001}
                                value={formatDegrees(center?.latitude)}
                                onChange={(value) => handleCoordinatesUpdate({ center: { ...center, latitude: parseFloat(value) } })}
                            />
                        </FormGroup>
                        <FormGroup controlId="map-views-center-position-height">
                            <ControlLabel><Message msgId="mapViews.height"/></ControlLabel>
                            <FormControl
                                type="number"
                                className="height-field"
                                value={formatHeight(center?.height)}
                                onChange={(value) => handleCoordinatesUpdate({ center: { ...center, height: parseFloat(value) } })}
                            />
                        </FormGroup>
                    </div>
                </div>
            </>}
            <FormGroup controlId="capture-view">
                <Button bsSize="sm" bsStyle="primary" onClick={() => onCaptureView(view)}>
                    <Message msgId="mapViews.captureThisViewPositions"/>
                </Button>
            </FormGroup>
        </Section>
    );
}

export default PositionsSection;
