/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { camelCase } from 'lodash';
import { Glyphicon, ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import { DropdownList } from 'react-widgets';

import MSButton from '../../misc/Button';
import DrawMeasureSupport from './DrawMeasureSupport';
import MeasureToolbar from '../../mapcontrols/measure/MeasureToolbar';
import { MeasureTypes, defaultUnitOfMeasureOptions, measureIcons } from '../../../utils/MeasureUtils';
import tooltip from '../../misc/enhancers/tooltip';
import { getMessageById } from '../../../utils/LocaleUtils';
import { download } from '../../../utils/FileUtils';
import { convertMeasuresToGeoJSON } from '../../../utils/MeasurementUtils';

const Button = tooltip(MSButton);

/**
 * This component provides a toolbar to control the DrawMeasureSupport component
 * @name MeasurementSupport
 * @prop {object} map instance of the current map library in use
 * @prop {boolean} active activate the drawing functionalities
 * @prop {string} defaultMeasureType initial measurement type to enable, one of: POLYLINE_DISTANCE_3D, AREA_3D, POINT_COORDINATES, HEIGHT_FROM_TERRAIN, ANGLE_3D and SLOPE
 * @prop {string} measureType measurement type to enable, one of: POLYLINE_DISTANCE_3D, AREA_3D, POINT_COORDINATES, HEIGHT_FROM_TERRAIN, ANGLE_3D and SLOPE
 * @prop {function} onChangeMeasureType callback triggered once one of the measure buttons in the toolbar is clicked
 * @prop {boolean} hideInfoLabel hide labels the show the measure value
 * @prop {boolean} hideSegmentsLengthLabels hide labels that show segment distance value
 * @prop {object} unitsOfMeasure object that list all the measure type unit of measure in use eg: { [MeasureTypes.POLYLINE_DISTANCE_3D]: { value: 'm', label: 'm' }, ... }
 * @prop {function} onUpdateFeatures callback triggered on draw end with the updated features
 * @prop {function} onChangeUnitOfMeasure callback triggered after selecting a different unit of measure
 * @prop {array} tools list of measure type to enable as buttons in the toolbar eg: [MeasureTypes.POLYLINE_DISTANCE_3D, MeasureTypes.AREA_3D, MeasureTypes.POINT_COORDINATES, MeasureTypes.HEIGHT_FROM_TERRAIN, MeasureTypes.ANGLE_3D, MeasureTypes.SLOPE]
 */
function MeasurementSupport({
    map,
    active,
    measureType,
    onChangeMeasureType,
    defaultMeasureType,
    hideInfoLabel,
    hideSegmentsLengthLabels,
    unitsOfMeasure,
    unitsOfMeasureOptions = defaultUnitOfMeasureOptions,
    onUpdateFeatures,
    onChangeUnitOfMeasure,
    tools = [
        MeasureTypes.POLYLINE_DISTANCE_3D,
        MeasureTypes.AREA_3D,
        MeasureTypes.POINT_COORDINATES,
        MeasureTypes.HEIGHT_FROM_TERRAIN,
        MeasureTypes.ANGLE_3D,
        MeasureTypes.SLOPE
    ],
    onClose,
    measurement,
    onAddAsLayer
}, { messages }) {

    const [clearId, setClearId] = useState(0);

    const uomOptions = unitsOfMeasureOptions[measureType];

    function handleChangeUnitOfMeasure(value) {
        onChangeUnitOfMeasure(measureType, value);
    }

    function getUnitOfMeasureValue() {
        return unitsOfMeasure[measureType];
    }

    function handleChangeGeometryType(type) {
        onChangeMeasureType(type);
    }

    useEffect(() => {
        if (active) {
            handleChangeGeometryType(defaultMeasureType);
        }
    }, [active, defaultMeasureType]);

    if (!active) {
        return null;
    }

    return (
        <>
            <DrawMeasureSupport
                map={map}
                active={!!measureType}
                type={measureType}
                clearId={clearId}
                hideInfoLabel={hideInfoLabel}
                hideSegmentsLengthLabels={hideSegmentsLengthLabels}
                unitsOfMeasure={unitsOfMeasure}
                onUpdateCollection={(collection) => onUpdateFeatures(collection?.features || [])}
                tooltipLabels={{
                    [MeasureTypes.POLYLINE_DISTANCE_3D]: {
                        start: getMessageById(messages, 'measureComponent.tooltipPolylineDistance3DStart'),
                        end: getMessageById(messages, 'measureComponent.tooltipPolylineDistance3DEnd')
                    },
                    [MeasureTypes.AREA_3D]: {
                        start: getMessageById(messages, 'measureComponent.tooltipArea3DStart'),
                        missingVertex: getMessageById(messages, 'measureComponent.tooltipArea3DMissingVertex'),
                        end: getMessageById(messages, 'measureComponent.tooltipArea3DEnd')
                    },
                    [MeasureTypes.POINT_COORDINATES]: {
                        start: getMessageById(messages, 'measureComponent.tooltipPointCoordinatesStart')
                    },
                    [MeasureTypes.HEIGHT_FROM_TERRAIN]: {
                        start: getMessageById(messages, 'measureComponent.tooltipHeightFromTerrainStart')
                    },
                    [MeasureTypes.ANGLE_3D]: {
                        start: getMessageById(messages, 'measureComponent.tooltipAngle3DStart')
                    },
                    [MeasureTypes.SLOPE]: {
                        start: getMessageById(messages, 'measureComponent.tooltipSlopeStart')
                    }
                }}
                infoLabelsFormat={{
                    [MeasureTypes.POLYLINE_DISTANCE_3D]: value => value,
                    [MeasureTypes.AREA_3D]: value => value,
                    [MeasureTypes.POINT_COORDINATES]: (value, { latitude, longitude } = {}) =>
                        `${getMessageById(messages, 'measureComponent.latitude')}: ${latitude.toFixed(6)}\n` +
                        `${getMessageById(messages, 'measureComponent.longitude')}: ${longitude.toFixed(6)}\n` +
                        `${getMessageById(messages, 'measureComponent.altitude')}: ${value}`,
                    [MeasureTypes.HEIGHT_FROM_TERRAIN]: value => value,
                    [MeasureTypes.ANGLE_3D]: value => value,
                    [MeasureTypes.SLOPE]: value => value
                }}
            />
            <MeasureToolbar
                info={
                    <DropdownList
                        disabled={!uomOptions}
                        value={getUnitOfMeasureValue()}
                        data={uomOptions}
                        onChange={handleChangeUnitOfMeasure}
                        textField="label"
                        valueField="value"
                    />
                }
                onClose={onClose}
            >
                <ButtonToolbar>
                    <ButtonGroup>
                        {tools.map((type) => {
                            return (
                                <Button
                                    key={type}
                                    className="square-button-md"
                                    bsStyle={measureType === type ? 'success' : 'primary'}
                                    tooltipId={`measureComponent.${camelCase(type)}Measure`}
                                    active={measureType === type}
                                    onClick={handleChangeGeometryType.bind(null, type)}
                                >
                                    <Glyphicon glyph={measureIcons[type]} />
                                </Button>
                            );
                        })}
                    </ButtonGroup>
                    <ButtonGroup>
                        <Button
                            className="square-button-md"
                            bsStyle="primary"
                            tooltipId="measureComponent.resetTooltip"
                            onClick={() => setClearId(clearId + 1)}
                        >
                            <Glyphicon glyph="trash" />
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                        <Button
                            className="square-button-md"
                            bsStyle="primary"
                            tooltipId="measureComponent.exportToGeoJSON"
                            disabled={(measurement?.features?.length || 0) === 0}
                            onClick={() => download(
                                JSON.stringify(convertMeasuresToGeoJSON(measurement.features)),
                                'measurements.json',
                                'application/geo+json'
                            )}
                        >
                            <Glyphicon glyph="ext-json" />
                        </Button>
                        {onAddAsLayer && <Button
                            className="square-button-md"
                            bsStyle="primary"
                            tooltipId="measureComponent.addAsLayer"
                            disabled={(measurement?.features?.length || 0) === 0}
                            onClick={() => onAddAsLayer(measurement.features)}
                        >
                            <Glyphicon glyph="add-layer" />
                        </Button>}
                    </ButtonGroup>
                </ButtonToolbar>
            </MeasureToolbar>
        </>
    );
}

MeasurementSupport.contextTypes = {
    messages: PropTypes.object
};

export default MeasurementSupport;
