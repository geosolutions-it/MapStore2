/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Row, Col } = require('react-bootstrap');
const {isNil} = require('lodash');
const NumberFormat = require('../../../I18N/Number');
const decimalToAeronautical = require('../../../misc/coordinateeditors/enhancers/decimalToAeronautical');

/**
 * Format 1 decimal coordinate into degrees, minutes, seconds, direction format.
 * @prop {value} value to format
 *
 */
const AeronauticalCoordinate = decimalToAeronautical(({
    degrees = 0,
    minutes = 0,
    seconds = 0,
    direction,
    integerFormat,
    decimalFormat
}) => (<span className="coordinate-dms">
    <NumberFormat key="latD" numberParams={integerFormat} value={degrees} />
    <span>°&nbsp;</span><NumberFormat key="latM" numberParams={integerFormat} value={minutes} /><span>&apos;&nbsp;</span>
    <NumberFormat key="latS" numberParams={decimalFormat} value={seconds} /><span>&apos;&apos;&nbsp;</span>
        &nbsp;<span>{direction}</span>
</span>));

/**
 * Display coordinates in "decimal" or "aeronautical" formats.
 * TODO: maybe is better move formatting components in some common place.
 */
module.exports = ({
    integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 0},
    decimalFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 4, minimumFractionDigits: 4},
    coordinate = {},
    formatCoord = "decimal",
    className
}) =>
    (<Row className={className}>
        {
            (<Col xs={12}>
                {(isNil(coordinate.lat) || isNil(coordinate.lon))
                    ? null
                    : formatCoord === "decimal"
                        ? <div className="ms-coordinates-decimal">Lat: <NumberFormat value={(Math.round(coordinate.lat * 100000) / 100000)} /> - Long: <NumberFormat value={coordinate.lon} /></div>
                        : <div className="ms-coordinates-aeronautical">
                            <span>Lat: <AeronauticalCoordinate integerFormat={integerFormat} decimalFormat={decimalFormat} value={coordinate.lat} /></span>
                            <span> - </span>
                            <span> Long: <AeronauticalCoordinate coordinate="lon" integerFormat={integerFormat} decimalFormat={decimalFormat} value={coordinate.lon} /></span>
                        </div>
                }
            </Col>)}
    </Row>);

